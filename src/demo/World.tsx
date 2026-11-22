import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Bloom, KeyLight, Look, RoundBox } from '../kit/stage';
import { Atmosphere, C, Glow, Rig, glowTexture } from '../kit/three';
import { BIG_TEETH, CAM, SMALL_TEETH, bigAngle, force, smallAngle } from './timeline';

// The demo's 3D scene: two meshing gears on a workbench. A real episode's hero
// is a named real object built from reference photos (docs/QUALITY.md).

const MODULE = 0.1; // tooth size: pitch radius = teeth * MODULE / 2

const Gear: React.FC<{ teeth: number; angle: number; position: [number, number, number]; color: string }> = ({ teeth, angle, position, color }) => {
  const r = (teeth * MODULE) / 2;
  const toothW = Math.PI * MODULE * 0.5;
  return (
    <group position={position} rotation={[0, 0, angle]}>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r - MODULE * 0.6, r - MODULE * 0.6, 0.16, Math.max(32, teeth * 3)]} />
        <meshStandardMaterial color={color} roughness={0.32} metalness={0.75} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, 0, a]}>
            <RoundBox size={[MODULE * 1.1, toothW, 0.16]} radius={0.008} position={[r, 0, 0]} color={color} roughness={0.3} metalness={0.8} />
          </group>
        );
      })}
      {/* hub and shaft */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]}>
        <cylinderGeometry args={[r * 0.28, r * 0.28, 0.12, 32]} />
        <meshStandardMaterial color="#2A2F3A" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* a marker so the turning reads */}
      <mesh position={[r * 0.62, 0, 0.09]}>
        <sphereGeometry args={[Math.max(0.03, r * 0.06), 16, 16]} />
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const glow = useMemo(() => glowTexture(), []);
  const rSmall = (SMALL_TEETH * MODULE) / 2;
  const rBig = (BIG_TEETH * MODULE) / 2;
  // Centres so the pitch circles touch; the half-tooth offset makes them mesh.
  const smallX = 1.9;
  const bigX = smallX - rSmall - rBig;
  const f = force(t);
  return (
    <>
      <Rig cam={CAM} t={t} />
      <Look />
      <Atmosphere density={0.02} />
      <color attach="background" args={['#070B16']} />
      <ambientLight intensity={0.25} />
      <KeyLight target={[0, 0, 0]} />
      <pointLight position={[2.5, 1.5, 2]} intensity={6} color={C.warm} />
      <Gear teeth={BIG_TEETH} angle={bigAngle(t) + Math.PI / BIG_TEETH} position={[bigX, 0, 0]} color="#8C96A8" />
      <Gear teeth={SMALL_TEETH} angle={smallAngle(t)} position={[smallX, 0, 0]} color="#C9A86A" />
      {/* workbench */}
      <mesh receiveShadow position={[0, 0, -0.2]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#141A26" roughness={0.85} />
      </mesh>
      {/* the force arrow on the big gear's rim */}
      {f > 0 ? (
        <group position={[bigX - rBig - 0.05, 0, 0.12]}>
          <mesh position={[0, -0.6 * f, 0]}>
            <boxGeometry args={[0.08, 1.2 * f, 0.04]} />
            <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
          <Glow map={glow} position={[0, -0.6 * f, 0.05]} size={1.6 * f} color={C.amber} opacity={0.5} />
        </group>
      ) : null}
      <Bloom />
    </>
  );
};
