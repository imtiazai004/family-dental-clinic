import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { lerp } from "@/lib/stage";
import { bar, type PathPoint } from "../geometry";

// A whole jaw of teeth, seen from above as a horseshoe: round at the front, with two straight legs
// running back. Used by the two denture chapters. y = 0 is the gum line.
const HALF_WIDTH = 2.3;
const DEPTH = 2.9;
// The horseshoe is pushed back so it sits around the origin, which is what the camera looks at.
const BACK = 0.85;
// How far round the line runs each way from the front. Past a quarter turn it is the straight legs.
const SWEEP = 2;

function onLine(angle: number): PathPoint {
  const side = Math.sign(angle);
  if (Math.abs(angle) > Math.PI / 2)
    return { x: side * HALF_WIDTH, z: -DEPTH * (Math.abs(angle) - Math.PI / 2) - BACK, nx: side, nz: 0 };
  const nx = DEPTH * Math.sin(angle);
  const nz = HALF_WIDTH * Math.cos(angle);
  const n = Math.hypot(nx, nz);
  return { x: HALF_WIDTH * Math.sin(angle), z: DEPTH * Math.cos(angle) - BACK, nx: nx / n, nz: nz / n };
}

// The line measured out in steps, so that places on it can be found by distance along it.
const STEPS = 400;
const line: (PathPoint & { along: number })[] = [];
for (let i = 0; i <= STEPS; i++) {
  const p = onLine(lerp(-SWEEP, SWEEP, i / STEPS));
  const before = line[i - 1];
  line.push({ ...p, along: before ? before.along + Math.hypot(p.x - before.x, p.z - before.z) : 0 });
}
const LENGTH = line[STEPS].along;

// A point `along` the line from its left end, moved `out` from the line (negative for inward).
export function onJaw(along: number, out = 0): PathPoint {
  let i = 0;
  while (i < STEPS - 1 && line[i + 1].along < along) i++;
  const a = line[i];
  const b = line[i + 1];
  const t = (along - a.along) / (b.along - a.along);
  const nx = lerp(a.nx, b.nx, t);
  const nz = lerp(a.nz, b.nz, t);
  const n = Math.hypot(nx, nz);
  return { x: lerp(a.x, b.x, t) + (nx / n) * out, z: lerp(a.z, b.z, t) + (nz / n) * out, nx: nx / n, nz: nz / n };
}

// Left to right: two large back teeth, two smaller ones, then the six front teeth, mirrored.
// `back` teeth use the molar crown and the others the incisor crown, each scaled to its width.
const BACK_TOOTH = { back: true, width: 0.78, scale: [0.57, 0.57, 0.57] };
const SMALL_BACK_TOOTH = { back: true, width: 0.58, scale: [0.42, 0.58, 0.42] };
const CORNER_TOOTH = { back: false, width: 0.62, scale: [0.585, 0.66, 0.585] };
const SIDE_TOOTH = { back: false, width: 0.6, scale: [0.57, 0.6, 0.57] };
const MIDDLE_TOOTH = { back: false, width: 0.68, scale: [0.64, 0.64, 0.64] };
const HALF = [BACK_TOOTH, BACK_TOOTH, SMALL_BACK_TOOTH, SMALL_BACK_TOOTH, CORNER_TOOTH, SIDE_TOOTH, MIDDLE_TOOTH];
const ROW = [...HALF, ...[...HALF].reverse()];
const GAP = 0.02;

export type JawTooth = {
  x: number;
  z: number;
  turn: number;
  back: boolean;
  scale: [number, number, number];
  // Where the tooth is along the line, and how much of the line it takes up.
  along: number;
  width: number;
};

export function jawTeeth(): JawTooth[] {
  const total = ROW.reduce((sum, tooth) => sum + tooth.width + GAP, 0);
  let along = (LENGTH - total) / 2;
  return ROW.map((tooth) => {
    const centre = along + (tooth.width + GAP) / 2;
    along += tooth.width + GAP;
    const at = onJaw(centre);
    return {
      x: at.x,
      z: at.z,
      turn: Math.atan2(at.nx, at.nz),
      back: tooth.back,
      scale: tooth.scale as [number, number, number],
      along: centre,
      width: tooth.width,
    };
  });
}

// A bar along part of the jaw, from `from` to `to` along the line, and `out` from it.
export function jawBar(
  from: number,
  to: number,
  shape: { top: number; bottom: number; halfThickness: number; round?: number },
  out = 0,
) {
  return bar((t) => onJaw(lerp(from, to, t), out), shape, 96);
}

// The strip that the whole row of teeth stands in: the gum, or the pink base of a complete denture.
export const JAW_RIDGE = { top: 0.02, bottom: -0.7, halfThickness: 0.48 };
export const buildJawRidge = () => jawBar(0, LENGTH, JAW_RIDGE, 0);

// --- Removable partial denture chapter. ---

const merge = (parts: THREE.BufferGeometry[]) => {
  const merged = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  return merged;
};

// The teeth the partial denture replaces: the last three on each side. The tooth next to each gap
// is the one a clasp holds on to.
export const MISSING = [0, 1, 2, 11, 12, 13];
const HELD = [3, 10];
// The frame runs round the inside of the jaw, against the gum.
export const FRAME_OUT = -0.57;
const CLASP = { radius: 0.31, height: 0.3, gap: 1.9 };

export function buildPartial(teeth: JawTooth[]) {
  const edge = (i: number, side: number) => teeth[i].along + (side * teeth[i].width) / 2;

  // A pink base over the gum on each side, where the teeth are missing.
  const shape = { top: 0.1, bottom: -0.5, halfThickness: 0.55, round: 0.1 };
  const bases = merge([jawBar(edge(0, -1) - 0.25, edge(2, 1), shape), jawBar(edge(11, -1), edge(13, 1) + 0.25, shape)]);

  // One metal bar from one base to the other, round the inside of the jaw.
  const frame = jawBar(
    teeth[0].along,
    teeth[13].along,
    { top: -0.14, bottom: -0.5, halfThickness: 0.06, round: 0.02 },
    FRAME_OUT,
  );

  // A clasp: a ring open at the front, round the tooth it holds, joined to the frame by an arm over
  // the gum. Built round the tooth's own upright axis, facing +z, then put where the tooth is.
  const clasps = merge(
    HELD.map((i) => {
      const ring = new THREE.TorusGeometry(CLASP.radius, 0.03, 8, 40, Math.PI * 2 - CLASP.gap)
        .rotateZ(Math.PI / 2 + CLASP.gap / 2)
        .rotateX(Math.PI / 2)
        .translate(0, CLASP.height, 0);
      const reach = -FRAME_OUT - CLASP.radius;
      const over = new THREE.BoxGeometry(0.07, 0.05, reach).translate(0, CLASP.height, -CLASP.radius - reach / 2);
      const down = new THREE.BoxGeometry(0.07, CLASP.height + 0.3, 0.05).translate(0, CLASP.height / 2 - 0.15, FRAME_OUT);
      return merge([ring, over, down]).rotateY(teeth[i].turn).translate(teeth[i].x, 0, teeth[i].z);
    }),
  );

  return { bases, frame, clasps };
}
