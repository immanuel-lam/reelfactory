import React, { useMemo } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { canvas, tex } from './three';
import { brand } from './brand';

// A city built from real geodata: the output of tools/geodata.mjs (OpenStreetMap
// footprints, heights, levels, parts, roof shapes, streets and trees, in the
// film's metres). Nothing here is placed by hand: every building stands on its
// mapped footprint at its mapped height.
//
// Facades are tiled per real storey (3.4 m) and bay (3.0 m). Street-level walls
// get lit shopfronts. Buildings tagged stone or sandstone, and the named landmarks in
// niche/brand.json "stoneLandmarks", get a stone facade with arched windows. Parts with
// roof:shape=dome get domes (copper green on the heritage buildings).

export type GeoShape = {
  osm: string; name?: string; h: number; minH: number; src: 'height' | 'levels' | 'default';
  levels?: number; roof?: string; roofH?: number; colour?: string; material?: string; heritage?: boolean; kind?: string;
  outer: [number, number][]; holes: [number, number][][]; hasParts?: boolean;
};
export type GeoLine = { osm: string; kind: string; name?: string; lanes?: number; width?: number; pts: [number, number][] };
export type GeoData = {
  source: string; fetched: string | null;
  buildings: GeoShape[]; parts: GeoShape[]; roads: GeoLine[]; rail: GeoLine[];
  trees: [number, number, number | null, string | null][]; lamps: [number, number][];
};

const LEVEL = 3.4;
const BAY = 3.0;
/** Stone landmarks confirmed in reference photos (niche/brand.json); other buildings use their OSM material tags. */
const SANDSTONE_NAMES = brand.stoneLandmarks.length ? new RegExp(brand.stoneLandmarks.join('|'), 'i') : /(?!)/;

// --- facade tiles (one bay by one storey, repeated) ----------------------------------------------
const officeTile = (seed: string, litShare: number) => {
  const [c, x] = canvas(64 * 4, 64 * 4); // 4 bays x 4 storeys per texture, so lit windows vary
  const wall = ['#6E7480', '#7C7468', '#5E6672', '#857E74'][Math.floor(random(`${seed}w`) * 4)];
  x.fillStyle = wall;
  x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++)
    for (let k = 0; k < 4; k++) {
      const lit = random(`${seed}${r}-${k}`) < litShare;
      const warm = random(`${seed}c${r}-${k}`) > 0.4;
      x.fillStyle = lit ? (warm ? '#FFD9A0' : '#DDE8FF') : '#1C2230';
      x.fillRect(k * 64 + 6, r * 64 + 10, 52, 40);
      x.fillStyle = 'rgba(0,0,0,0.25)';
      x.fillRect(k * 64 + 6, r * 64 + 46, 52, 4);
    }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 4, 1 / 4);
  return t;
};
/** A glass curtain wall for towers: dark blue glass, floor lines, some floors lit. */
const glassTile = (seed: string) => {
  const [c, x] = canvas(256, 256);
  x.fillStyle = '#1E2A3C';
  x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) {
    const lit = random(`${seed}g${r}`) < 0.45;
    x.fillStyle = lit ? 'rgba(220,232,255,0.55)' : 'rgba(60,80,110,0.5)';
    x.fillRect(0, r * 64 + 8, 256, 44);
    x.fillStyle = '#0E141E';
    x.fillRect(0, r * 64 + 56, 256, 8);
    for (let k = 0; k < 8; k++) x.fillRect(k * 32, r * 64, 2, 64);
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 4, 1 / 4);
  return t;
};
/** A masonry mid-rise (brick, render or stone): punched windows. */
const masonryTile = (seed: string) => {
  const [c, x] = canvas(256, 256);
  x.fillStyle = ['#8C6A52', '#A89880', '#B0A08A', '#7A6656'][Math.floor(random(`${seed}m`) * 4)];
  x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++)
    for (let k = 0; k < 4; k++) {
      const lit = random(`${seed}${r}-${k}`) < 0.5;
      x.fillStyle = lit ? '#FFD49A' : '#262A33';
      x.fillRect(k * 64 + 18, r * 64 + 12, 28, 40);
      x.fillStyle = 'rgba(255,255,255,0.18)';
      x.fillRect(k * 64 + 14, r * 64 + 52, 36, 4);
    }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 4, 1 / 4);
  return t;
};

const sandstoneTile = () => {
  const [c, x] = canvas(256, 256);
  x.fillStyle = '#B98D5E';
  x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++)
    for (let k = 0; k < 4; k++) {
      const cx = k * 64 + 32;
      const top = r * 64 + 12;
      const lit = random(`sa${r}-${k}`) > 0.3;
      x.fillStyle = lit ? '#FFCF8A' : '#2A2018';
      x.beginPath();
      x.moveTo(cx - 14, top + 44);
      x.lineTo(cx - 14, top + 14);
      x.arc(cx, top + 14, 14, Math.PI, 0);
      x.lineTo(cx + 14, top + 44);
      x.closePath();
      x.fill();
      x.fillStyle = '#D6AD7C';
      x.fillRect(k * 64, r * 64 + 56, 64, 6); // string course
      x.fillRect(k * 64, r * 64, 5, 64); // pilaster
    }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 4, 1 / 4);
  return t;
};
const shopTile = () => {
  const [c, x] = canvas(256, 64);
  x.fillStyle = '#15181F';
  x.fillRect(0, 0, 256, 64);
  for (let k = 0; k < 4; k++) {
    const warm = random(`sh${k}`) > 0.3;
    const g = x.createLinearGradient(0, 14, 0, 64);
    g.addColorStop(0, warm ? '#FFE6B8' : '#E0EAFF');
    g.addColorStop(1, warm ? '#B9824C' : '#6F86A8');
    x.fillStyle = g;
    x.fillRect(k * 64 + 4, 16, 56, 48);
    x.fillStyle = random(`shs${k}`) > 0.5 ? '#E4022D' : '#F2F5FA';
    x.fillRect(k * 64 + 10, 4, 30 + random(`shl${k}`) * 20, 7);
  }
  const t = tex(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(1 / 4, 1);
  return t;
};

// --- geometry ------------------------------------------------------------------------------------
type Acc = { pos: number[]; uv: number[]; nrm: number[] };
const acc = (): Acc => ({ pos: [], uv: [], nrm: [] });
const toGeo = (a: Acc) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(a.pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(a.uv, 2));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(a.nrm, 3));
  return g;
};
const area = (r: [number, number][]) => {
  let s = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return s / 2;
};
/** Walls of one ring from y0 to y1, facing outwards (or inwards for a courtyard hole). */
const walls = (a: Acc, ring: [number, number][], y0: number, y1: number, hole: boolean, vOff = 0) => {
  if (y1 - y0 < 0.05) return;
  // In film coordinates (x, z) with y up, a counter-clockwise ring seen from above has
  // its outward normal to the right of each edge when walked... we test and flip.
  const ccw = area(ring) > 0;
  let u = 0;
  for (let i = 0; i + 1 < ring.length; i++) {
    let [ax, az] = ring[i];
    let [bx, bz] = ring[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.05) continue;
    if (ccw === hole) [ax, az, bx, bz] = [bx, bz, ax, az];
    // outward normal for this winding
    const nx = (bz - az) / len;
    const nz = -(bx - ax) / len;
    const u0 = u / BAY;
    const u1 = (u + len) / BAY;
    const v0 = (y0 - vOff) / LEVEL;
    const v1 = (y1 - vOff) / LEVEL;
    const quad = [
      [ax, y0, az, u0, v0], [bx, y0, bz, u1, v0], [bx, y1, bz, u1, v1],
      [ax, y0, az, u0, v0], [bx, y1, bz, u1, v1], [ax, y1, az, u0, v1],
    ];
    for (const [x, y, z, uu, vv] of quad) {
      a.pos.push(x, y, z);
      a.uv.push(uu, vv);
      a.nrm.push(nx, 0, nz);
    }
    u += len;
  }
};
const cap = (a: Acc, outer: [number, number][], holes: [number, number][][], y: number) => {
  const shape = new THREE.Shape(outer.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))));
  const g = new THREE.ShapeGeometry(shape);
  const p = g.getAttribute('position');
  const idx = g.getIndex();
  const order = idx ? Array.from(idx.array) : Array.from({ length: p.count }, (_, i) => i);
  for (let i = 0; i < order.length; i += 3) {
    // shape (x, -z) -> world (x, y, z), keep the face pointing up
    const tri = [order[i], order[i + 2], order[i + 1]];
    for (const k of tri) {
      a.pos.push(p.getX(k), y, -p.getY(k));
      a.uv.push(p.getX(k) / 8, p.getY(k) / 8);
      a.nrm.push(0, 1, 0);
    }
  }
  g.dispose();
};

export type GeoBounds = { xMin: number; xMax: number; zMin: number; zMax: number; /** keep this clear (the tracks) */ clearX?: number };

const isSandstone = (b: GeoShape) =>
  /sandstone|stone/i.test(b.material ?? '') || (!!b.name && SANDSTONE_NAMES.test(b.name));

export const useGeoCity = (geo: GeoData, bounds: GeoBounds) =>
  useMemo(() => {
    // office = [glass towers, masonry mid-rise, office grid]
    const groups = { office: [acc(), acc(), acc()], sand: acc(), shop: acc(), roof: acc(), sandRoof: acc() };
    const domes: { x: number; z: number; y: number; r: number; copper: boolean }[] = [];
    const sandParents = geo.buildings.filter((b) => b.hasParts && isSandstone(b));
    const within = (s: GeoShape) => {
      const xs = s.outer.map((p) => p[0]);
      const zs = s.outer.map((p) => p[1]);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs);
      const z0 = Math.min(...zs);
      const z1 = Math.max(...zs);
      if (x1 < bounds.xMin || x0 > bounds.xMax || z1 < bounds.zMin || z0 > bounds.zMax) return false;
      // nothing low may stand over the tracks
      if (bounds.clearX !== undefined && x0 < bounds.clearX && x1 > -bounds.clearX - 3.4 && s.minH < 6) return false;
      return true;
    };
    const inside = ([x, z]: [number, number], poly: [number, number][]) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, zi] = poly[i];
        const [xj, zj] = poly[j];
        if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi || 1e-9) + xi) c = !c;
      }
      return c;
    };
    // A building drawn with parts keeps its outline as the main block, at the lowest height of
    // its parts (so it is never taller than the real roof); dome parts then sit on that roof.
    const blocks = geo.buildings.filter((b) => b.hasParts).map((b) => {
      const ps = geo.parts.filter((p) => inside([p.outer.reduce((q, v) => q + v[0], 0) / p.outer.length, p.outer.reduce((q, v) => q + v[1], 0) / p.outer.length], b.outer));
      const roof = Math.min(...ps.filter((p) => p.roof !== 'dome').map((p) => p.h), ...ps.map((p) => p.h - (p.roofH ?? 0) - 3));
      return { ...b, h: Number.isFinite(roof) ? Math.max(roof, 3) : b.h, hasParts: false, _roof: roof };
    });
    const domeParts = geo.parts.map((p) => {
      if (p.roof !== 'dome' || p.minH > 0.5) return p;
      // a dome's drum stands on the main roof, not on the street
      const top = p.h - (p.roofH ?? 0);
      return { ...p, minH: Math.max(0, top - 4) };
    });
    const shapes = [...geo.buildings.filter((b) => !b.hasParts), ...blocks, ...domeParts].filter(within);
    let n = 0;
    for (const s of shapes) {
      const c = [s.outer.reduce((q, p) => q + p[0], 0) / s.outer.length, s.outer.reduce((q, p) => q + p[1], 0) / s.outer.length] as [number, number];
      const sand = isSandstone(s) || sandParents.some((b) => inside(c, b.outer));
      const top = s.roof === 'dome' ? s.h - (s.roofH ?? 0) : s.h;
      const shopTop = s.minH < 0.5 ? Math.min(4.2, top) : s.minH;
      // the facade follows the building: towers are glass, low buildings masonry (or their OSM material)
      const mat = s.material ?? '';
      const cls = /glass/i.test(mat) || s.h > 55 ? 0 : /brick|stone|plaster|concrete/i.test(mat) || s.h < 28 ? 1 : 2;
      void n;
      const body = sand ? groups.sand : groups.office[cls];
      if (s.minH < 0.5 && !sand) {
        walls(groups.shop, s.outer, 0, shopTop, false);
        walls(body, s.outer, shopTop, top, false);
      } else walls(body, s.outer, s.minH, top, false);
      for (const h of s.holes) walls(body, h, s.minH, top, true);
      cap(sand ? groups.sandRoof : groups.roof, s.outer, s.holes, top);
      if (s.roof === 'dome') {
        const r = Math.sqrt(Math.abs(area(s.outer)) / Math.PI);
        domes.push({ x: c[0], z: c[1], y: top, r, copper: sand });
      }
    }
    return {
      office: groups.office.map(toGeo), sand: toGeo(groups.sand), shop: toGeo(groups.shop),
      roof: toGeo(groups.roof), sandRoof: toGeo(groups.sandRoof), domes, count: shapes.length,
    };
  }, [geo, bounds]);

/** The buildings, as a few merged meshes. */
export const GeoCity: React.FC<{ geo: GeoData; bounds: GeoBounds; night?: number }> = ({ geo, bounds, night = 1 }) => {
  const city = useGeoCity(geo, bounds);
  const tiles = useMemo(() => ({ office: [glassTile('g1'), masonryTile('m1'), officeTile('o1', 0.5)], sand: sandstoneTile(), shop: shopTile() }), []);
  return (
    <group>
      {city.office.map((g, i) => (
        <mesh key={i} geometry={g} receiveShadow castShadow>
          <meshStandardMaterial map={tiles.office[i]} emissiveMap={tiles.office[i]} emissive="#FFFFFF" emissiveIntensity={0.42 * night} roughness={0.55} metalness={0.15} color="#9AA0AA" />
        </mesh>
      ))}
      <mesh geometry={city.sand} receiveShadow castShadow>
        <meshStandardMaterial map={tiles.sand} emissiveMap={tiles.sand} emissive="#FFFFFF" emissiveIntensity={0.3 * night} roughness={0.85} color="#F2E2CC" />
      </mesh>
      <mesh geometry={city.shop} receiveShadow>
        <meshStandardMaterial map={tiles.shop} emissiveMap={tiles.shop} emissive="#FFFFFF" emissiveIntensity={0.9 * night} roughness={0.4} color="#B0B0B0" />
      </mesh>
      <mesh geometry={city.roof} receiveShadow>
        <meshStandardMaterial color="#4A505A" roughness={0.9} />
      </mesh>
      <mesh geometry={city.sandRoof} receiveShadow>
        <meshStandardMaterial color="#8E6E52" roughness={0.9} />
      </mesh>
      {city.domes.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]} castShadow>
          <sphereGeometry args={[d.r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={d.copper ? '#6FB09A' : '#7A808A'} roughness={0.55} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

/** Roads that cross the paved street, as asphalt strips (widths from lanes or the road class). */
export const GeoRoads: React.FC<{ geo: GeoData; bounds: GeoBounds; skipNames?: RegExp }> = ({ geo, bounds, skipNames }) => {
  const g = useMemo(() => {
    const a = acc();
    const W: Record<string, number> = { primary: 12, secondary: 10, tertiary: 9, residential: 7, unclassified: 7, service: 4.5, living_street: 6, trunk: 14, primary_link: 6, secondary_link: 6 };
    for (const r of geo.roads) {
      if (!(r.kind in W)) continue;
      if (skipNames && r.name && skipNames.test(r.name)) continue;
      const w = r.width ?? (r.lanes ? r.lanes * 3.3 : W[r.kind]);
      for (let i = 0; i + 1 < r.pts.length; i++) {
        const [ax, az] = r.pts[i];
        const [bx, bz] = r.pts[i + 1];
        if (Math.max(ax, bx) < bounds.xMin || Math.min(ax, bx) > bounds.xMax || Math.max(az, bz) < bounds.zMin || Math.min(az, bz) > bounds.zMax) continue;
        const len = Math.hypot(bx - ax, bz - az) || 1;
        const nx = (-(bz - az) / len) * (w / 2);
        const nz = ((bx - ax) / len) * (w / 2);
        const quad = [[ax + nx, az + nz], [ax - nx, az - nz], [bx - nx, bz - nz], [ax + nx, az + nz], [bx - nx, bz - nz], [bx + nx, bz + nz]];
        // keep each triangle facing up
        const t1 = quad.slice(0, 3);
        const t2 = quad.slice(3);
        for (const t of [t1, t2]) {
          const cross = (t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) - (t[1][1] - t[0][1]) * (t[2][0] - t[0][0]);
          const tri = cross > 0 ? [t[0], t[2], t[1]] : t;
          for (const [x, z] of tri) {
            a.pos.push(x, 0.0015, z);
            a.uv.push(x / 6, z / 6);
            a.nrm.push(0, 1, 0);
          }
        }
      }
    }
    return toGeo(a);
  }, [geo, bounds, skipNames]);
  return (
    <mesh geometry={g} receiveShadow>
      <meshStandardMaterial color="#3A3E46" roughness={0.92} />
    </mesh>
  );
};
