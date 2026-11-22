import React, { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { random } from 'remotion';
import * as THREE from 'three';
import { Camera } from './camera';
import { V3 } from './time';
import { brand } from './brand';

// Small 3D building blocks shared by every explainer.
//
// Rules that keep renders deterministic:
// - All motion comes from the frame (props), never from useFrame or Date.now().
// - Random numbers come from remotion's seeded `random("some-key")`.
// - Text that must stay sharp is DOM (see Overlays), not 3D.

export const C = {
  night: '#070B16',
  navy: '#0B101E',
  /** The one warm accent for data and energy (niche/brand.json "accent"). */
  amber: brand.accent,
  amberHot: brand.accentHot,
  /** The niche's secondary colour (niche/brand.json "secondary"). */
  accent2: brand.secondary,
  white: '#F2F5FA',
  warm: '#FFCE8F',
  red: '#FF4A3D',
  green: '#3DF08A',
};

export const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d') as CanvasRenderingContext2D] as const;
};
export const tex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Soft round glow, for additive sprites and light pools. */
export const glowTexture = () => {
  const [c, x] = canvas(256, 256);
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return tex(c);
};

/** A crisp dot with a small halo, for point clouds. */
export const dotTexture = () => {
  const [c, x] = canvas(64, 64);
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return tex(c);
};

/** Lit windows for a building face. */
export const windowTexture = (seed: string) => {
  const [c, x] = canvas(256, 512);
  x.fillStyle = '#000';
  x.fillRect(0, 0, 256, 512);
  for (let r = 0; r < 20; r++) {
    for (let k = 0; k < 8; k++) {
      if (random(`${seed}-${r}-${k}`) < 0.6) continue;
      const warm = random(`${seed}-w-${r}-${k}`) > 0.3;
      const a = 0.3 + 0.65 * random(`${seed}-a-${r}-${k}`);
      x.fillStyle = warm ? `rgba(255,206,143,${a})` : `rgba(160,196,255,${a * 0.8})`;
      x.fillRect(k * 32 + 9, r * 25.6 + 7, 14, 12);
    }
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** Night sky with a faint warm band at the horizon. */
export const skyTexture = () => {
  const [c, x] = canvas(16, 512);
  const g = x.createLinearGradient(0, 0, 0, 512);
  // Late dusk: deep blue overhead, violet lower down, a warm line at the horizon.
  g.addColorStop(0, '#04060F');
  g.addColorStop(0.25, '#0A1230');
  g.addColorStop(0.4, '#1C2A66');
  g.addColorStop(0.47, '#4A3F86');
  g.addColorStop(0.497, '#9A5E7C');
  g.addColorStop(0.505, '#C98A6A');
  g.addColorStop(0.52, '#141B33');
  g.addColorStop(1, '#070B16');
  x.fillStyle = g;
  x.fillRect(0, 0, 16, 512);
  return tex(c);
};

/** One line of text on a texture (signs, displays). Call after fonts load. */
export const textTexture = (
  text: string,
  opts: { w: number; h: number; size: number; color: string; bg?: string; weight?: number },
) => {
  const [c, x] = canvas(opts.w, opts.h);
  if (opts.bg) {
    x.fillStyle = opts.bg;
    x.fillRect(0, 0, opts.w, opts.h);
  }
  x.fillStyle = opts.color;
  x.font = `${opts.weight ?? 800} ${opts.size}px Manrope, sans-serif`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, opts.w / 2, opts.h / 2 + opts.size * 0.04);
  return tex(c);
};

/** Moves the default camera to the film's camera at time t. */
export const Rig: React.FC<{ cam: Camera; t: number }> = ({ cam, t }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    const k = cam(t);
    camera.position.set(...k.p);
    camera.fov = k.fov;
    camera.near = 0.3;
    camera.far = 3000;
    camera.lookAt(...k.l);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  });
  return null;
};

/** Night fog and a dark background. */
export const Atmosphere: React.FC<{ color?: string; density?: number }> = ({ color = '#0A1022', density = 0.0056 }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2(color, density);
    scene.background = new THREE.Color('#05070D');
  }, [scene, color, density]);
  return null;
};

export const Sky: React.FC<{ map: THREE.Texture }> = ({ map }) => (
  <mesh>
    <sphereGeometry args={[1400, 32, 24]} />
    <meshBasicMaterial map={map} side={THREE.BackSide} fog={false} toneMapped={false} depthWrite={false} />
  </mesh>
);

/** An additive glow sprite. It ignores fog, so lights read at a distance. */
export const Glow: React.FC<{ map: THREE.Texture; position: V3; size: number; color: string; opacity?: number }> = ({
  map, position, size, color, opacity = 1,
}) =>
  opacity <= 0.002 ? null : (
    <sprite position={position} scale={[size, size, 1]}>
      {/* The sprite is only the soft halo; the bright core comes from <Bloom />. */}
      <spriteMaterial map={map} color={color} opacity={opacity * 0.5} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </sprite>
  );

/** A flat glow lying on the ground (light pools, wet-road reflections). */
export const GroundGlow: React.FC<{ map: THREE.Texture; position: V3; size: [number, number]; color: string; opacity: number }> = ({
  map, position, size, color, opacity,
}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
    <planeGeometry args={size} />
    <meshBasicMaterial map={map} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
  </mesh>
);

export const Box: React.FC<{
  size: V3; position: V3; color: string; emissive?: string; emissiveIntensity?: number; roughness?: number; metalness?: number;
  rotation?: V3;
}> = ({ size, position, color, emissive, emissiveIntensity = 1, roughness = 0.7, metalness = 0, rotation }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} emissive={emissive ?? '#000'} emissiveIntensity={emissive ? emissiveIntensity : 0} roughness={roughness} metalness={metalness} />
  </mesh>
);

/** A flat ribbon along points that share one plane (z is kept). */
export const ribbon = (pts: V3[], width: number) => {
  const pos: number[] = [];
  const idx: number[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * (width / 2);
    const ny = (dx / len) * (width / 2);
    pos.push(p[0] + nx, p[1] + ny, p[2], p[0] - nx, p[1] - ny, p[2]);
    if (i < pts.length - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
};
