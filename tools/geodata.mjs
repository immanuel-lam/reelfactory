#!/usr/bin/env node
// Real-world geometry for an episode's world, from OpenStreetMap.
//
//   node tools/geodata.mjs <id> --bbox south,west,north,east --origin lat,lon [--bearing deg] [--track highway=primary] [--fit metres] [--straighten]
//
// --track names the OSM way the film runs along (a road, a rail or a tram
// line); check how your place tags it on openstreetmap.org first.
//
// Fetches buildings (footprints, heights, levels, parts, roof shapes, names,
// materials), streets, rail and tram tracks, trees and street lamps inside the
// box from the Overpass API, and writes src/<id>/geo.json in the film's local
// metres:
//
//   +Z runs along the street at `bearing` (degrees clockwise from north; by
//   default fitted to the nearest track through the origin), +X is to the left
//   of that direction (west when the street runs north), +Y is up. The origin
//   is snapped onto the nearest track way.
//
// The raw answer is kept in cache/osm/ so a run can be repeated offline.
// Data: (c) OpenStreetMap contributors, ODbL. Put the credit in the end card or
// captions. Every number printed at the end goes in the episode's sources.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const id = args[0];
const opt = (k) => {
  const i = args.indexOf(`--${k}`);
  return i < 0 ? undefined : args[i + 1];
};
if (!id || !opt('bbox') || !opt('origin')) {
  console.error('usage: node tools/geodata.mjs <id> --bbox s,w,n,e --origin lat,lon [--bearing deg] [--track highway=primary] [--fit metres]');
  process.exit(1);
}
const [S, Wb, N, E] = opt('bbox').split(',').map(Number);
const [lat0, lon0] = opt('origin').split(',').map(Number);
const [trackKey, trackVal] = (opt('track') ?? 'highway=primary').split('=');
const FIT = Number(opt('fit') ?? 150);
const STRAIGHTEN = args.includes('--straighten');
const bb = `(${S},${Wb},${N},${E})`;
const query = `[out:json][timeout:120];
(
  way["building"]${bb}; relation["building"]${bb}; way["building:part"]${bb}; relation["building:part"]${bb};
  way["highway"]${bb}; way["railway"]${bb};
  node["natural"="tree"]${bb}; node["highway"="street_lamp"]${bb};
);
out body; >; out skel qt;`;

fs.mkdirSync(path.join(root, 'cache/osm'), { recursive: true });
const hash = crypto.createHash('sha1').update(query).digest('hex').slice(0, 12);
const rawPath = path.join(root, 'cache/osm', `${id}-${hash}.json`);
let raw;
if (fs.existsSync(rawPath)) {
  raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  console.log(`using cached ${path.relative(root, rawPath)}`);
} else {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'explainer-geodata/1.0' },
    body: new URLSearchParams({ data: query }),
  });
  if (!res.ok) {
    console.error(`Overpass error ${res.status}: ${(await res.text()).slice(0, 400)}`);
    process.exit(1);
  }
  raw = await res.json();
  raw.fetched = new Date().toISOString();
  fs.writeFileSync(rawPath, JSON.stringify(raw));
  console.log(`fetched ${raw.elements.length} elements -> ${path.relative(root, rawPath)}`);
}

// --- projection ------------------------------------------------------------------------
const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
const ky = 110574;
const en = (lat, lon) => [(lon - lon0) * kx, (lat - lat0) * ky]; // east, north (m)

const nodes = new Map();
const ways = new Map();
const rels = [];
for (const el of raw.elements) {
  if (el.type === 'node') nodes.set(el.id, { ...(nodes.get(el.id) ?? {}), ...el });
  else if (el.type === 'way') ways.set(el.id, { ...(ways.get(el.id) ?? {}), ...el });
  else if (el.type === 'relation') rels.push(el);
}
const wayEN = (w) => (w.nodes ?? []).map((n) => nodes.get(n)).filter(Boolean).map((n) => en(n.lat, n.lon));

// --- the street axis: snap the origin to the nearest track and fit its bearing ------------
const tracks = [...ways.values()].filter((w) => w.tags?.[trackKey] === trackVal);
let best = null;
for (const w of tracks) {
  const p = wayEN(w);
  for (let i = 0; i + 1 < p.length; i++) {
    const [ax, ay] = p[i];
    const [bx, by] = p[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const L2 = dx * dx + dy * dy || 1;
    const u = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L2));
    const cx = ax + u * dx;
    const cy = ay + u * dy;
    const d = Math.hypot(cx, cy);
    if (!best || d < best.d) best = { d, cx, cy, w };
  }
}
if (!best) {
  console.error(`no ${trackKey}=${trackVal} way in the box`);
  process.exit(1);
}
let bearing = opt('bearing') !== undefined ? Number(opt('bearing')) : null;
if (bearing === null) {
  // Least-squares direction of the snapped track's points within FIT metres of the origin.
  const p = wayEN(best.w).filter(([x, y]) => Math.hypot(x - best.cx, y - best.cy) < FIT);
  const mx = p.reduce((a, q) => a + q[0], 0) / p.length;
  const my = p.reduce((a, q) => a + q[1], 0) / p.length;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const [x, y] of p) {
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
    sxy += (x - mx) * (y - my);
  }
  const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy); // direction angle from east
  let b = 90 - (ang * 180) / Math.PI; // degrees clockwise from north
  b = ((b % 360) + 360) % 360;
  if (b > 90 && b < 270) b = (b + 180) % 360; // point the axis northwards
  bearing = b;
}
const th = (bearing * Math.PI) / 180;
const O = [best.cx, best.cy];
/** east/north metres -> film [x, z] */
const rawXZ = ([e, n]) => {
  const de = e - O[0];
  const dn = n - O[1];
  const along = de * Math.sin(th) + dn * Math.cos(th);
  const acrossEast = de * Math.cos(th) - dn * Math.sin(th);
  return [-acrossEast, along];
};
// --straighten: measure x across from the snapped track itself, so a street that bends a
// little becomes straight in the film and everything beside it keeps its distance from the
// track (the film's tracks are straight). Beyond the ends of the track the end offsets hold.
const trackLine = wayEN(best.w).map(rawXZ).sort((a, b) => a[1] - b[1]);
const trackX = (z) => {
  if (!STRAIGHTEN || trackLine.length < 2) return 0;
  if (z <= trackLine[0][1]) return trackLine[0][0];
  for (let i = 0; i + 1 < trackLine.length; i++) {
    const [x0, z0] = trackLine[i];
    const [x1, z1] = trackLine[i + 1];
    if (z <= z1) return x0 + ((x1 - x0) * (z - z0)) / (z1 - z0 || 1);
  }
  return trackLine[trackLine.length - 1][0];
};
const toXZ = (p) => {
  const [x, z] = rawXZ(p);
  return [+(x - trackX(z)).toFixed(2), +z.toFixed(2)];
};

// --- rings (closed ways and multipolygon relations) -----------------------------------------
const joinRings = (memberWays) => {
  const segs = memberWays.map((w) => [...(w.nodes ?? [])]).filter((s) => s.length > 1);
  const rings = [];
  while (segs.length) {
    let ring = segs.shift();
    let grew = true;
    while (ring[0] !== ring[ring.length - 1] && grew) {
      grew = false;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        const end = ring[ring.length - 1];
        if (s[0] === end) ring = ring.concat(s.slice(1));
        else if (s[s.length - 1] === end) ring = ring.concat([...s].reverse().slice(1));
        else continue;
        segs.splice(i, 1);
        grew = true;
        break;
      }
    }
    if (ring.length > 3 && ring[0] === ring[ring.length - 1]) rings.push(ring);
  }
  return rings;
};
const ringXZ = (ids) => ids.map((n) => nodes.get(n)).filter(Boolean).map((n) => toXZ(en(n.lat, n.lon)));

const num = (v) => {
  if (v === undefined) return undefined;
  const m = String(v).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
};
const LEVEL_H = 3.4;
const heights = (t) => {
  const h = num(t.height);
  const lv = num(t['building:levels']);
  const roofH = num(t['roof:height']) ?? 0;
  const minH = num(t.min_height) ?? (num(t['building:min_level']) !== undefined ? num(t['building:min_level']) * LEVEL_H : 0);
  if (h !== undefined) return { h, minH, src: 'height' };
  if (lv !== undefined) return { h: lv * LEVEL_H + roofH, minH, src: 'levels' };
  return { h: 3 * LEVEL_H, minH, src: 'default' };
};
const shape = (t, outer, holes, osm) => {
  const { h, minH, src } = heights(t);
  return {
    osm, name: t.name, h: +h.toFixed(1), minH: +minH.toFixed(1), src,
    levels: num(t['building:levels']), roof: t['roof:shape'], roofH: num(t['roof:height']),
    colour: t['building:colour'] ?? t.colour, material: t['building:material'],
    heritage: t.heritage !== undefined || t['heritage:operator'] !== undefined, kind: t.building ?? t['building:part'],
    outer, holes,
  };
};

const buildings = [];
const parts = [];
for (const w of ways.values()) {
  const t = w.tags ?? {};
  if (!(t.building || t['building:part'])) continue;
  if ((w.nodes ?? []).length < 4 || w.nodes[0] !== w.nodes[w.nodes.length - 1]) continue;
  const s = shape(t, ringXZ(w.nodes), [], `way/${w.id}`);
  (t['building:part'] && !t.building ? parts : buildings).push(s);
}
for (const r of rels) {
  const t = r.tags ?? {};
  if (!(t.building || t['building:part'])) continue;
  const outerWays = r.members.filter((m) => m.type === 'way' && m.role !== 'inner').map((m) => ways.get(m.ref)).filter(Boolean);
  const innerWays = r.members.filter((m) => m.type === 'way' && m.role === 'inner').map((m) => ways.get(m.ref)).filter(Boolean);
  const holes = joinRings(innerWays).map(ringXZ);
  for (const ring of joinRings(outerWays)) (t['building:part'] && !t.building ? parts : buildings).push(shape(t, ringXZ(ring), holes, `relation/${r.id}`));
}
// A building drawn with parts: the parts carry its shape, so mark the outline.
const inside = ([x, z], poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi || 1e-9) + xi) c = !c;
  }
  return c;
};
const centroid = (poly) => [poly.reduce((a, p) => a + p[0], 0) / poly.length, poly.reduce((a, p) => a + p[1], 0) / poly.length];
for (const b of buildings) b.hasParts = parts.some((p) => inside(centroid(p.outer), b.outer));

const lines = (pred) =>
  [...ways.values()].filter((w) => pred(w.tags ?? {})).map((w) => ({ osm: `way/${w.id}`, kind: w.tags.highway ?? w.tags.railway, name: w.tags.name, lanes: num(w.tags.lanes), width: num(w.tags.width), pts: wayEN(w).map(toXZ) }));
const roads = lines((t) => t.highway && !['footway', 'steps', 'path', 'corridor', 'elevator', 'street_lamp', 'cycleway'].includes(t.highway));
const rail = lines((t) => t.railway && t.railway !== 'platform');
const trees = [...nodes.values()].filter((n) => n.tags?.natural === 'tree').map((n) => [...toXZ(en(n.lat, n.lon)), num(n.tags.height) ?? null, n.tags.species ?? n.tags['species:en'] ?? null]);
const lamps = [...nodes.values()].filter((n) => n.tags?.highway === 'street_lamp').map((n) => toXZ(en(n.lat, n.lon)));

const out = {
  source: '(c) OpenStreetMap contributors, ODbL 1.0, via the Overpass API',
  fetched: raw.fetched ?? null,
  query: { bbox: [S, Wb, N, E], origin: [lat0, lon0], track: `${trackKey}=${trackVal}` },
  frame: { bearing: +bearing.toFixed(2), originSnappedTo: `way/${best.w.id}`, straightened: STRAIGHTEN, trackZ: [trackLine[0]?.[1], trackLine.at(-1)?.[1]], note: '+Z along the street at `bearing`, +X to its left, +Y up, metres; straightened = x measured from the snapped track' },
  buildings, parts, roads, rail, trees, lamps,
};
const dest = path.join(root, 'src', id, 'geo.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out));
const all = [...buildings, ...parts];
const count = (k) => all.filter((b) => b.src === k).length;
console.log(`wrote ${path.relative(root, dest)}`);
console.log(`street bearing ${bearing.toFixed(2)} deg; origin snapped to way/${best.w.id} (${best.d.toFixed(1)} m away)`);
console.log(`buildings ${buildings.length}, parts ${parts.length}: height from 'height' ${count('height')}, from levels ${count('levels')}, default ${count('default')}`);
console.log(`roads ${roads.length}, rail ${rail.length}, trees ${trees.length}, lamps ${lamps.length}`);
const named = all.filter((b) => b.name && Math.abs(centroid(b.outer)[0]) < 80 && Math.abs(centroid(b.outer)[1]) < 400);
console.log('named near the street:', named.map((b) => `${b.name} (${b.h} m, ${b.src})`).slice(0, 30).join('; '));
