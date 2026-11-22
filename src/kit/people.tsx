import React from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { Glow } from './three';
import { V3 } from './time';

// People. A place with nobody in it looks like a diagram. These are simple
// but read as people at any size: a head with hair, a jacket in a colour you
// can see at night, arms, legs, and an optional phone lighting the face.

const JACKETS = ['#3E5C8A', '#8A4B3C', '#4F7A5E', '#B8A07A', '#6B5B8C', '#C9B037', '#A8553F', '#5E7F96', '#D8D2C4'];
const TROUSERS = ['#1B2233', '#2A2E38', '#3A3226', '#20303A'];
const SKIN = ['#C99A7A', '#8D5B3E', '#E0B594', '#6E4630', '#D7A27E'];
const HAIR = ['#17120E', '#2B1D14', '#5A4632', '#0C0C0E', '#8C8073'];

const Limb: React.FC<{ from: V3; to: V3; r: number; color: string }> = ({ from, to, r, color }) => {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <capsuleGeometry args={[r, Math.max(0.01, len - r * 2), 3, 8]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
};

export type PersonProps = {
  position: V3;
  /** Facing, in radians around Y (0 = looking towards +Z). */
  rotation?: number;
  /** Changes height, clothes, skin and hair. */
  seed: string;
  pose?: 'stand' | 'sit';
  /** Holding a lit phone (needs `glow`). */
  phone?: boolean;
  glow?: THREE.Texture;
  /** One arm raised to a handrail (standing in a vehicle). */
  holding?: boolean;
};

export const Person: React.FC<PersonProps> = ({ position, rotation = 0, seed, pose = 'stand', phone, glow, holding }) => {
  const pick = <T,>(xs: T[], k: string) => xs[Math.floor(random(seed + k) * xs.length)];
  const h = 1.58 + random(`${seed}h`) * 0.26; // standing height
  const jacket = pick(JACKETS, 'j');
  const legs = pick(TROUSERS, 't');
  const skin = pick(SKIN, 's');
  const hair = pick(HAIR, 'r');
  const sit = pose === 'sit';
  // Heights of the joints.
  const hip = sit ? 0.5 : h * 0.5;
  const shoulder = hip + h * 0.32;
  const head = shoulder + h * 0.13;
  const sh = 0.2; // half shoulder width
  const hand: V3 = phone ? [0.05, shoulder - 0.2, 0.3] : holding ? [sh + 0.06, shoulder + 0.38, 0.05] : [sh + 0.05, hip - 0.02, 0.04];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* legs */}
      {[1, -1].map((s) =>
        sit ? (
          <group key={s}>
            <Limb from={[s * 0.1, hip, 0]} to={[s * 0.1, hip, 0.42]} r={0.075} color={legs} />
            <Limb from={[s * 0.1, hip, 0.42]} to={[s * 0.1, 0.06, 0.44]} r={0.07} color={legs} />
          </group>
        ) : (
          <Limb key={s} from={[s * 0.1, hip, 0]} to={[s * 0.11, 0.05, 0.02]} r={0.078} color={legs} />
        ),
      )}
      {/* torso */}
      <mesh position={[0, (hip + shoulder) / 2, 0]} castShadow>
        <capsuleGeometry args={[0.19, shoulder - hip - 0.2, 4, 12]} />
        <meshStandardMaterial color={jacket} roughness={0.8} />
      </mesh>
      {/* arms */}
      <Limb from={[sh, shoulder - 0.04, 0]} to={hand} r={0.058} color={jacket} />
      <Limb from={[-sh, shoulder - 0.04, 0]} to={phone ? [-0.05, shoulder - 0.2, 0.3] : [-sh - 0.05, hip - 0.02, 0.04]} r={0.058} color={jacket} />
      {/* head and hair */}
      <mesh position={[0, head, 0.01]} castShadow>
        <sphereGeometry args={[0.112, 16, 14]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      <mesh position={[0, head + 0.035, -0.02]}>
        <sphereGeometry args={[0.118, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={hair} roughness={0.9} />
      </mesh>
      {phone ? (
        <>
          <mesh position={[0, shoulder - 0.17, 0.32]} rotation={[-0.6, 0, 0]}>
            <boxGeometry args={[0.075, 0.15, 0.012]} />
            <meshStandardMaterial color="#DCE8FF" emissive="#CFE0FF" emissiveIntensity={2.4} />
          </mesh>
          {glow ? <Glow map={glow} position={[0, shoulder - 0.05, 0.3]} size={0.9} color="#BCD3FF" opacity={0.7} /> : null}
        </>
      ) : null}
    </group>
  );
};
