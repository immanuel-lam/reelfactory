import * as THREE from 'three';
import { EASE, V3, clamp01, lerp, v3lerp } from './time';

// One camera function for the whole film: no cuts. The 3D scene and the DOM
// overlays both read it, so a label can stay pinned to a 3D point.

export type CamKey = {
  t: number;
  /** Camera position. */
  p: V3;
  /** Look-at point. */
  l: V3;
  fov?: number;
  /** Name of a moving anchor: p and l are then relative to it. */
  rel?: string;
  /** Easing of the move INTO this key. */
  ease?: (x: number) => number;
};
export type CamState = { p: V3; l: V3; fov: number };
export type Camera = (t: number) => CamState;

export const makeCamera = (keys: CamKey[], anchors: Record<string, (t: number) => V3> = {}): Camera => {
  const resolve = (k: CamKey, t: number) => {
    if (!k.rel) return { p: k.p, l: k.l };
    const a = anchors[k.rel](t);
    return {
      p: [k.p[0] + a[0], k.p[1] + a[1], k.p[2] + a[2]] as V3,
      l: [k.l[0] + a[0], k.l[1] + a[1], k.l[2] + a[2]] as V3,
    };
  };
  return (t) => {
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const u = (b.ease ?? EASE.inOut)(clamp01((t - a.t) / (b.t - a.t)));
    const ra = resolve(a, t);
    const rb = resolve(b, t);
    // A slow handheld drift so the frame never sits perfectly still.
    const p = v3lerp(ra.p, rb.p, u);
    return {
      p: [p[0] + Math.sin(t * 0.7) * 0.05, p[1] + Math.sin(t * 0.53 + 1) * 0.035, p[2]],
      l: v3lerp(ra.l, rb.l, u),
      fov: lerp(a.fov ?? 38, b.fov ?? 38, u),
    };
  };
};

/** Projects a world point to authored pixels (1080 x 1920). */
export const makeProjector = (cam: Camera) => {
  const camera = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.3, 3000);
  const v = new THREE.Vector3();
  return (t: number, p: V3) => {
    const k = cam(t);
    camera.position.set(...k.p);
    camera.fov = k.fov;
    camera.lookAt(...k.l);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    v.set(...p).project(camera);
    return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, behind: v.z > 1 };
  };
};
export type Projector = ReturnType<typeof makeProjector>;
