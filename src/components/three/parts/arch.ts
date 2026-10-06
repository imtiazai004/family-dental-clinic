import type * as THREE from "three";
import { bar } from "../geometry";

// A row of six front teeth standing in a curved strip of gum, as seen in a smile.
// The teeth are the incisor from parts/incisor.ts at different sizes. y = 0 is the gum line.
const RADIUS = 2.5;
// The curve is pushed back so the row sits around the origin, which is what the camera looks at.
const BACK = 1.55;
const TOOTH_WIDTH = 1.06;
const GAP = 0.04;
// Left to right: the two outer teeth, then the smaller ones beside the middle pair, mirrored.
const SIZES = [0.95, 0.85, 1, 1, 0.85, 0.95];

export type Place = { x: number; z: number; turn: number; size: number };

const onCurve = (angle: number, out = RADIUS) => ({
  x: out * Math.sin(angle),
  z: out * Math.cos(angle) - BACK,
});

// Where each tooth stands, and how far it is turned to face out of the curve.
export function archPlaces(): Place[] {
  const total = SIZES.reduce((sum, size) => sum + size * TOOTH_WIDTH + GAP, 0);
  let along = -total / 2;
  return SIZES.map((size) => {
    const width = size * TOOTH_WIDTH + GAP;
    const turn = (along + width / 2) / RADIUS;
    along += width;
    return { ...onCurve(turn), turn, size };
  });
}

// Moves something that follows the curve outward from it by `by`, all the way along, by making it
// larger about the curve's centre.
export function pushOut(thing: THREE.Object3D, by: number) {
  const grow = 1 + by / RADIUS;
  thing.scale.set(grow, 1, grow);
  thing.position.z = BACK * (grow - 1);
}

// Half of the angle the teeth take up, plus a little gum past the last tooth on each side.
const REACH = (SIZES.reduce((sum, size) => sum + size * TOOTH_WIDTH + GAP, 0) / 2 + 0.45) / RADIUS;

// The strip of gum: a rounded bar bent along the curve.
export function buildGumArch() {
  return bar(
    (t) => {
      const angle = (2 * t - 1) * REACH;
      return { ...onCurve(angle), nx: Math.sin(angle), nz: Math.cos(angle) };
    },
    { top: 0.02, bottom: -1.2, halfThickness: 0.56 },
  );
}
