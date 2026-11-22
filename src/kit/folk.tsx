import React from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { Glow } from './three';
import { V3 } from './time';

// People with a body you can read in daylight: a shaped torso (shoulders,
// waist, hips), tapered thighs and shins with knees, upper arms and forearms
// with elbows, hands, a neck, a head with hair, shoes. Some carry a backpack
// or a tote bag, some wear a skirt or a cap. They cast shadows.
//
// `phase` drives the walk cycle (radians; about 4.2 per metre walked) and
// `moving` (0..1) blends between standing and walking. Prefer it to
// kit/people.tsx for anyone seen in focus.

const TOPS = ['#2F5D8C', '#B5523B', '#3F7A5A', '#D8C9A8', '#6A5A8E', '#D9B23A', '#E9E6DF', '#20242C', '#8FB3D9', '#C46D8E', '#5C6B3A', '#F2F0EA'];
const BOTTOMS = ['#1E2636', '#2B2F38', '#4A3E30', '#3A4A5E', '#C8BBA0', '#5A5F68', '#151820'];
const SKIN = ['#E8C1A0', '#C99A7A', '#8D5B3E', '#E0B594', '#6E4630', '#D7A27E', '#A87452'];
const HAIR = ['#17120E', '#2B1D14', '#5A4632', '#0C0C0E', '#8C8073', '#B88A4E', '#3A2A20'];
const SHOES = ['#121418', '#F0F0F0', '#4A3020', '#2A2E36', '#8A7A66'];
const BAGS = ['#1C1F26', '#6B4A30', '#2E4A6E', '#8A2E2E', '#C9B79A', '#3D5A3D'];

const geo = new Map<string, THREE.BufferGeometry>();
const cached = (k: string, make: () => THREE.BufferGeometry) => {
  if (!geo.has(k)) geo.set(k, make());
  return geo.get(k)!;
};
/** A torso of unit height: hips, waist, chest, shoulders, round in section (scaled flat by the mesh). */
const torsoGeo = () =>
  cached('torso', () => {
    const pts = [
      [0.0, 0.0], [0.155, 0.0], [0.17, 0.06], [0.15, 0.3], [0.165, 0.55], [0.19, 0.8], [0.2, 0.88], [0.17, 0.96], [0.07, 1.0], [0.0, 1.0],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(pts, 20);
  });
/** A tapered limb of unit length hanging down from its top joint. */
const limbGeo = (r0: number, r1: number) =>
  cached(`limb${r0}-${r1}`, () => {
    const g = new THREE.CylinderGeometry(r0, r1, 1, 12, 1);
    g.translate(0, -0.5, 0);
    return g;
  });
const ball = () => cached('ball', () => new THREE.SphereGeometry(1, 18, 14));
const cap = () => cached('cap', () => new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.56));
const skirtGeo = () =>
  cached('skirt', () => {
    const g = new THREE.CylinderGeometry(0.17, 0.27, 1, 18, 1, true);
    g.translate(0, -0.5, 0);
    return g;
  });
const boxGeo = () => cached('box', () => new THREE.BoxGeometry(1, 1, 1));

const M: React.FC<{ color: string; rough?: number; emissive?: string; ei?: number; side?: THREE.Side }> = ({ color, rough = 0.85, emissive, ei = 0, side }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={0} emissive={emissive ?? '#000'} emissiveIntensity={ei} side={side} />
);

export type FolkProps = {
  position: V3;
  /** Facing, radians around Y (0 = towards +Z). */
  heading?: number;
  seed: string;
  /** Walk-cycle phase in radians. */
  phase?: number;
  /** 0 standing, 1 walking. */
  moving?: number;
  pose?: 'stand' | 'sit';
  phone?: boolean;
  glow?: THREE.Texture;
};

export const Folk: React.FC<FolkProps> = ({ position, heading = 0, seed, phase = 0, moving = 0, pose = 'stand', phone, glow }) => {
  const rnd = (k: string) => random(seed + k);
  const pick = <X,>(xs: X[], k: string) => xs[Math.floor(rnd(k) * xs.length)];
  const h = 1.56 + rnd('h') * 0.3;
  const s = h / 1.72;
  const top = pick(TOPS, 't');
  const bottom = pick(BOTTOMS, 'b');
  const skin = pick(SKIN, 's');
  const hair = pick(HAIR, 'r');
  const shoe = pick(SHOES, 'f');
  const skirt = rnd('k') < 0.22;
  const backpack = rnd('p') < 0.28;
  const tote = !backpack && rnd('o') < 0.25;
  const longHair = rnd('l') < 0.35;
  const hat = !longHair && rnd('c') < 0.15;
  const sit = pose === 'sit';

  const m = moving;
  const sw = Math.sin(phase) * 0.42 * m; // hip swing, + = left leg forward
  const kneeL = m * (0.06 + 0.62 * Math.max(0, Math.cos(phase)));
  const kneeR = m * (0.06 + 0.62 * Math.max(0, Math.cos(phase + Math.PI)));
  const bob = Math.abs(Math.cos(phase)) * 0.025 * m;

  const thigh = 0.44 * s;
  const shin = 0.43 * s;
  const hip = sit ? 0.48 : thigh + shin + 0.06 * s;
  const torsoH = 0.56 * s;
  const shoulder = hip + torsoH * 0.9;
  const headY = hip + torsoH + 0.17 * s;
  const shW = 0.2 * s;

  const leg = (side: 1 | -1) => {
    const a = sit ? Math.PI / 2 : side === 1 ? sw : -sw;
    const k = sit ? Math.PI / 2 : side === 1 ? kneeL : kneeR;
    return (
      <group key={side} position={[side * 0.095 * s, hip, 0]} rotation={[-a, 0, 0]}>
        <mesh geometry={limbGeo(0.085, 0.062)} scale={[s, thigh, s]} castShadow>
          <M color={bottom} />
        </mesh>
        <group position={[0, -thigh, 0]} rotation={[k, 0, 0]}>
          <mesh geometry={limbGeo(0.06, 0.042)} scale={[s, shin, s]} castShadow>
            <M color={skirt && !sit ? skin : bottom} />
          </mesh>
          <group position={[0, -shin, 0.04 * s]} rotation={[-k + a, 0, 0]}>
            <mesh geometry={ball()} position={[0, -0.03 * s, 0.05 * s]} scale={[0.05 * s, 0.04 * s, 0.13 * s]} castShadow>
              <M color={shoe} rough={0.55} />
            </mesh>
          </group>
        </group>
      </group>
    );
  };
  const arm = (side: 1 | -1) => {
    const swingA = side === 1 ? -sw * 0.8 : sw * 0.8;
    const holdPhone = phone && side === 1;
    const a = holdPhone ? 0.5 : swingA + (tote && side === -1 ? 0 : 0);
    const elbow = holdPhone ? 1.2 : 0.18 + 0.25 * m + (swingA > 0 ? swingA * 0.6 : 0);
    return (
      <group key={side} position={[side * shW, shoulder, 0]} rotation={[-a, 0, side * 0.07]}>
        <mesh geometry={limbGeo(0.06, 0.048)} scale={[s, 0.3 * s, s]} castShadow>
          <M color={top} />
        </mesh>
        <group position={[0, -0.3 * s, 0]} rotation={[-elbow, 0, 0]}>
          <mesh geometry={limbGeo(0.047, 0.038)} scale={[s, 0.27 * s, s]} castShadow>
            <M color={rnd('sl') < 0.4 ? skin : top} />
          </mesh>
          <mesh geometry={ball()} position={[0, -0.29 * s, 0]} scale={0.045 * s}>
            <M color={skin} />
          </mesh>
          {holdPhone ? (
            <>
              <mesh geometry={boxGeo()} position={[0, -0.32 * s, 0.02]} rotation={[0.3, 0, 0]} scale={[0.075, 0.15, 0.012]}>
                <M color="#DCE8FF" emissive="#CFE0FF" ei={1.6} />
              </mesh>
              {glow ? <Glow map={glow} position={[0, -0.32 * s, 0.1]} size={0.5} color="#BCD3FF" opacity={0.35} /> : null}
            </>
          ) : null}
        </group>
      </group>
    );
  };

  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, heading, 0]}>
      {/* a soft contact shadow under the feet */}
      {sit ? null : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012 - position[1] - bob, 0.02]} scale={[0.32 * s, 0.42 * s, 1]} renderOrder={-1}>
          <circleGeometry args={[1, 20]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      )}
      {leg(1)}
      {leg(-1)}
      {/* hips and torso */}
      <mesh geometry={torsoGeo()} position={[0, hip - 0.06 * s, 0]} scale={[s * 1.05, torsoH + 0.06 * s, s * 0.62]} castShadow>
        <M color={top} />
      </mesh>
      <mesh geometry={limbGeo(0.165, 0.17)} position={[0, hip + 0.06 * s, 0]} scale={[s, 0.14 * s, s * 0.66]} castShadow>
        <M color={bottom} />
      </mesh>
      {skirt && !sit ? (
        <mesh geometry={skirtGeo()} position={[0, hip + 0.06 * s, 0]} scale={[s, 0.42 * s, s * 0.8]} castShadow>
          <M color={bottom} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
      {arm(1)}
      {arm(-1)}
      {/* neck, head, hair */}
      <mesh geometry={limbGeo(0.045, 0.05)} position={[0, hip + torsoH + 0.07 * s, 0]} scale={[s, 0.08 * s, s]}>
        <M color={skin} />
      </mesh>
      <mesh geometry={ball()} position={[0, headY, 0.01]} scale={[0.095 * s, 0.115 * s, 0.105 * s]} castShadow>
        <M color={skin} rough={0.7} />
      </mesh>
      <mesh geometry={cap()} position={[0, headY + 0.02 * s, -0.01]} scale={[0.103 * s, 0.11 * s, 0.112 * s]} rotation={[-0.25, 0, 0]}>
        <M color={hat ? pick(BAGS, 'hc') : hair} rough={0.9} />
      </mesh>
      {longHair ? (
        <mesh geometry={ball()} position={[0, headY - 0.08 * s, -0.07 * s]} scale={[0.1 * s, 0.16 * s, 0.06 * s]} castShadow>
          <M color={hair} rough={0.9} />
        </mesh>
      ) : null}
      {hat ? (
        <mesh geometry={boxGeo()} position={[0, headY + 0.03 * s, 0.1 * s]} scale={[0.17 * s, 0.015, 0.1 * s]}>
          <M color={pick(BAGS, 'hc')} />
        </mesh>
      ) : null}
      {backpack ? (
        <mesh geometry={boxGeo()} position={[0, hip + torsoH * 0.6, -0.17 * s]} scale={[0.3 * s, 0.4 * s, 0.16 * s]} castShadow>
          <M color={pick(BAGS, 'bp')} rough={0.7} />
        </mesh>
      ) : null}
      {tote ? (
        <mesh geometry={boxGeo()} position={[-shW - 0.06 * s, hip - 0.02, 0.02]} rotation={[sw * 0.5, 0, 0]} scale={[0.07 * s, 0.34 * s, 0.32 * s]} castShadow>
          <M color={pick(BAGS, 'tb')} rough={0.75} />
        </mesh>
      ) : null}
    </group>
  );
};
