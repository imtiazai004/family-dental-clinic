import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { chapterView, lerp, SIDE_BY_SIDE_WIDTH, smoothstep, stage } from "@/lib/stage";

export const FOV = 30;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

// What the camera has to fit: centre height, height and width in model units, plus the viewing angle.
export type Shot = { y: number; h: number; w: number; az: number; el: number };
// Camera keyframes across a chapter's scroll progress.
export type Track = { p: number; shot: Shot }[];

// Where a DOM label points, in the local space of the part it follows.
// With `textX`, the leader line stretches from the anchor out to that x, so it can start inside a part.
export type Anchor = { part: RefObject<THREE.Object3D | null>; at: [number, number, number]; textX?: number };

export type ChapterFrame = {
  p: number; // smoothed scroll progress, 0 → 1
  dt: number;
  time: number;
  yaw: number; // extra turn from the visitor dragging
  side: boolean; // text sits beside the model (desktop) rather than under it
};

export const ease = (t: number) => t * t * (3 - 2 * t);

const shot: Shot = { y: 0, h: 1, w: 1, az: 0, el: 0 };
function shotAt(track: Track, p: number) {
  let i = 0;
  while (i < track.length - 2 && p > track[i + 1].p) i++;
  const a = track[i];
  const b = track[i + 1];
  const t = smoothstep(a.p, b.p, p);
  shot.y = lerp(a.shot.y, b.shot.y, t);
  shot.h = lerp(a.shot.h, b.shot.h, t);
  shot.w = lerp(a.shot.w, b.shot.w, t);
  shot.az = lerp(a.shot.az, b.shot.az, t);
  shot.el = lerp(a.shot.el, b.shot.el, t);
  return shot;
}

const dir = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3();
const wantPos = new THREE.Vector3();
const wantLook = new THREE.Vector3();
const point = new THREE.Vector3();
const frame: ChapterFrame = { p: 0, dt: 0, time: 0, yaw: 0, side: false };

// Runs one chapter: follows its scroll progress, calls `animate` to pose the parts, then frames the
// camera and places the labels. `animate` returns the opacity the labels should have (0 hides them).
export function useChapter(id: string, track: Track, anchors: Anchor[], animate: (f: ChapterFrame) => number) {
  const progress = useRef(0);
  const yaw = useRef(0);
  const look = useRef(new THREE.Vector3());
  const started = useRef(false);
  const labelsShown = useRef(false);

  useFrame((state, dt) => {
    const labels = stage.labels[id] ?? [];
    const v = chapterView(id, window.scrollY, window.innerHeight);
    if (!v.visible) {
      if (labelsShown.current) for (const el of labels) if (el) el.style.opacity = "0";
      labelsShown.current = false;
      return;
    }

    const first = !started.current;
    started.current = true;
    // From this frame on the scene is drawn, so the still image that stood in for it can go.
    if (first && stage.posters[id]) stage.posters[id].style.opacity = "0";
    progress.current = first ? v.progress : THREE.MathUtils.damp(progress.current, v.progress, 8, dt);
    yaw.current = THREE.MathUtils.damp(yaw.current, stage.dragYaw, 10, dt);

    const { width, height } = state.size;
    const aspect = width / height;
    const side = width >= SIDE_BY_SIDE_WIDTH;
    frame.p = progress.current;
    frame.dt = dt;
    frame.time = state.clock.elapsedTime;
    frame.yaw = yaw.current;
    frame.side = side;
    const labelOpacity = animate(frame);

    // Camera: fit the current shot into the part of the screen the text leaves free.
    const s = shotAt(track, progress.current);
    const fitW = side ? 0.46 : 0.86;
    const fitH = side ? 0.78 : 0.46;
    const dist = Math.max(s.h / fitH / (2 * TAN), s.w / fitW / (2 * TAN * aspect));
    const viewH = 2 * TAN * dist;
    const shiftX = side ? -0.2 * viewH * aspect : 0;
    const shiftY = side ? -0.02 * viewH : -0.19 * viewH;

    dir.set(Math.sin(s.az) * Math.cos(s.el), Math.sin(s.el), Math.cos(s.az) * Math.cos(s.el));
    right.set(Math.cos(s.az), 0, -Math.sin(s.az));
    up.crossVectors(dir, right);
    wantLook.set(0, s.y, 0).addScaledVector(right, shiftX).addScaledVector(up, shiftY);
    wantPos.copy(wantLook).addScaledVector(dir, dist);

    const k = first ? 1 : 1 - Math.exp(-6 * dt);
    const camera = state.camera;
    camera.position.lerp(wantPos, k);
    look.current.lerp(wantLook, k);
    camera.lookAt(look.current);

    labelsShown.current = labelOpacity > 0;
    if (labelOpacity > 0) {
      camera.updateMatrixWorld();
      state.scene.updateMatrixWorld();
    }
    anchors.forEach((a, i) => {
      const el = labels[i];
      if (!el) return;
      el.style.opacity = String(labelOpacity);
      if (labelOpacity === 0 || !a.part.current) return;
      const world = a.part.current.matrixWorld;
      point.fromArray(a.at).applyMatrix4(world).project(camera);
      const x = (point.x * 0.5 + 0.5) * width;
      const y = (-point.y * 0.5 + 0.5) * height;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translateY(-50%)`;
      if (a.textX !== undefined) {
        point.set(a.textX, a.at[1], a.at[2]).applyMatrix4(world).project(camera);
        const line = el.firstElementChild as HTMLElement;
        line.style.width = `${Math.max(0, (point.x * 0.5 + 0.5) * width - x)}px`;
      }
    });
  });
}
