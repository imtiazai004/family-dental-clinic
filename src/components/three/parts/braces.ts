import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Place } from "./arch";
import { incisorFront } from "./incisor";

// Braces on the row of front teeth from parts/arch.ts: a bracket on each tooth and one wire through
// them all. The teeth start out of line and are brought into line.

// How far into the gum the teeth stand. Deeper than usual, so a tooth that is lifted or tipped
// still shows no gap at the gum line.
const SUNK = -0.12;
// Height of the brackets above the gum line, the same on every tooth.
const BRACKET_HEIGHT = 0.6;

// How far each tooth starts out of line, left to right: moved, turned about its length, and tipped.
const OUT_OF_LINE = [
  { dx: 0, dy: 0.03, dz: -0.08, turn: 0.22, tip: 0.05 },
  { dx: 0.05, dy: -0.05, dz: 0.14, turn: -0.3, tip: -0.08 },
  { dx: 0.04, dy: 0.04, dz: -0.1, turn: 0.26, tip: 0.07 },
  { dx: -0.03, dy: -0.02, dz: 0.1, turn: 0.2, tip: -0.05 },
  { dx: -0.05, dy: 0.05, dz: -0.14, turn: -0.28, tip: 0.09 },
  { dx: 0, dy: -0.03, dz: 0.06, turn: 0.18, tip: -0.06 },
];

// Puts `tooth` where tooth i stands. `straight` runs from 0, out of line, to 1, in line.
export function poseTooth(tooth: THREE.Object3D, place: Place, i: number, straight: number) {
  const off = OUT_OF_LINE[i];
  const k = 1 - straight;
  tooth.position.set(place.x + off.dx * k, SUNK + off.dy * k, place.z + off.dz * k);
  tooth.rotation.set(0, place.turn + off.turn * k, off.tip * k);
  tooth.scale.setScalar(place.size);
}

// Where a bracket sits, in its tooth's own space. A tooth is scaled to its size, so the bracket's
// own scale undoes that: every bracket is the same size.
export function bracketSeat(place: Place) {
  const y = (BRACKET_HEIGHT - SUNK) / place.size;
  return { y, z: incisorFront(y), scale: 1 / place.size };
}

// The bracket's back is at z = 0, against the tooth. The wire runs across it through SLOT.
const SLOT = 0.075;

export function buildBracket() {
  const box = (w: number, h: number, d: number, y: number, z: number) =>
    new THREE.BoxGeometry(w, h, d).translate(0, y, z + d / 2);
  // A pad against the tooth, and two wings with the slot for the wire between them.
  const parts = [box(0.3, 0.26, 0.04, 0, 0), box(0.22, 0.08, 0.07, 0.07, 0.04), box(0.22, 0.08, 0.07, -0.07, 0.04)];
  const bracket = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  return bracket;
}

// The wire, as a tube through every bracket's slot, with a short tail past the last one each side.
// Built for teeth out of line and in line; both have the same number of points, in the same order,
// so the scene can move one into the other.
export function buildWire(places: Place[], straight: number) {
  const tooth = new THREE.Object3D();
  const through = places.map((place, i) => {
    poseTooth(tooth, place, i, straight);
    tooth.updateMatrix();
    const seat = bracketSeat(place);
    return new THREE.Vector3(0, seat.y, seat.z + SLOT * seat.scale).applyMatrix4(tooth.matrix);
  });
  const tail = (end: THREE.Vector3, next: THREE.Vector3) => end.clone().sub(next).setLength(0.24).add(end);
  const points = [tail(through[0], through[1]), ...through, tail(through[5], through[4])];
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, false, "centripetal"), 140, 0.02, 6);
}
