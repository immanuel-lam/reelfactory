import React, { useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { V3 } from './time';

// The look of the series: the things that make a 3D frame read as a film
// frame and not as a diagram. Put <Look />, one <KeyLight /> and <Bloom /> in
// every World, and give <ThreeCanvas> the `shadows` prop.
//
// - Shadows ground every object: without them things float.
// - An environment gives glass and paint something to reflect.
// - Bloom lets lamps, screens and signals glow the way a camera sees them.
// - Rounded edges catch a highlight; a hard box edge never does.

/** Renderer settings and soft reflections for the whole scene. */
export const Look: React.FC<{ reflections?: number; exposure?: number }> = ({ reflections = 0.1, exposure = 0.92 }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposure;
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = reflections;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, reflections, exposure]);
  return null;
};

/**
 * The one light that casts shadows. Aim it at the subject (`target` may move
 * every frame): the shadow area follows, so the shadows stay sharp.
 */
export const KeyLight: React.FC<{
  target: V3; from?: V3; color?: string; intensity?: number; size?: number;
}> = ({ target, from = [-14, 26, 16], color = '#C9D8FF', intensity = 0.85, size = 34 }) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight();
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    l.shadow.radius = 5;
    return l;
  }, []);
  useLayoutEffect(() => {
    light.color.set(color);
    light.intensity = intensity;
    const cam = light.shadow.camera;
    cam.left = -size;
    cam.right = size;
    cam.top = size;
    cam.bottom = -size;
    cam.near = 1;
    cam.far = 160;
    cam.updateProjectionMatrix();
    light.position.set(target[0] + from[0], target[1] + from[1], target[2] + from[2]);
    light.target.position.set(...target);
    light.target.updateMatrixWorld();
  });
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

/**
 * Bloom on bright things. It replaces the default render, so it must be the
 * last thing in the World. The effect has no memory between frames, so any
 * frame renders the same on its own.
 */
export const Bloom: React.FC<{ strength?: number; radius?: number; threshold?: number }> = ({
  strength = 0.26, radius = 0.5, threshold = 0.9,
}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), strength, radius, threshold));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera, strength, radius, threshold]);
  useLayoutEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);
  // Priority 1 tells the canvas that this component draws the frame.
  useFrame(() => composer.render(), 1);
  return null;
};

const roundedCache = new Map<string, RoundedBoxGeometry>();
/** A box with softened edges. Use it for anything manufactured: vehicles, phones, machines. */
export const RoundBox: React.FC<{
  size: V3; position: V3; color: string; radius?: number; emissive?: string; emissiveIntensity?: number;
  roughness?: number; metalness?: number; rotation?: V3; shadow?: boolean;
}> = ({ size, position, color, radius = 0.12, emissive, emissiveIntensity = 1, roughness = 0.5, metalness = 0.1, rotation, shadow = true }) => {
  const r = Math.min(radius, Math.min(...size) / 2 - 0.001);
  const key = `${size.join(',')}|${r}`;
  if (!roundedCache.has(key)) roundedCache.set(key, new RoundedBoxGeometry(size[0], size[1], size[2], 4, r));
  return (
    <mesh position={position} rotation={rotation} geometry={roundedCache.get(key)} castShadow={shadow} receiveShadow={shadow}>
      <meshStandardMaterial color={color} emissive={emissive ?? '#000'} emissiveIntensity={emissive ? emissiveIntensity : 0} roughness={roughness} metalness={metalness} />
    </mesh>
  );
};

/** Fine film grain over the finished frame (DOM, above the canvas). It changes every frame. */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.055 }) => (
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 997} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);
