import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { lerp, smoothstep } from "@/lib/stage";
import {
  CORE_BOTTOM,
  CORE_RADIUS,
  flat,
  molar,
  poly,
  revolve,
  smooth,
  surface,
  thread,
  threadedRows,
  tissue,
  type Cut,
  type P,
  type XY,
} from "../geometry";

// A natural molar with two roots. y = 0 is the gum line, where the enamel ends.
// The roots lie side by side along x, so the plane z = 0 cuts the tooth through both of them.
const CROWN: XY[] = [
  [0, 1.04],
  [0.16, 1.08],
  [0.34, 1.24],
  [0.5, 1.27],
  [0.62, 1.14],
  [0.67, 0.92],
  [0.685, 0.68],
  [0.65, 0.4],
  [0.57, 0.16],
  [0.5, 0],
];
const crownProfile = () => smooth(CROWN, 48, 1);

// Below the gum the tooth is its two roots and nothing else. Each root is one tube, from the gum
// line to its tip. At the gum line both tubes are the same round neck, one inside the other. Going
// down, each draws aside into its own oval, so a groove opens between them at the front and the
// back and deepens until, at ROOT_TOP, the roots part. Nothing has to be joined, so no seam shows.
const NECK_RADIUS = 0.5;
const ROOT_TOP = -0.3;
const ROOT_TIP = -2.45;
const NECK_ROWS = 10;
const ROOT_ROWS = 34;
// Rows bunch up toward the tip so its rounded end stays smooth.
const rootT = (i: number) => 1 - (1 - i / ROOT_ROWS) ** 1.5;

// One slice of a root: centre, height, half-widths across and front-to-back. t runs from -1 at the
// gum line, through 0 where the roots part, to 1 at the tip. Above 0 the slice reaches past x = 0,
// into the other root.
function rootRing(side: number, t: number) {
  if (t < 0) {
    const m = 1 + t;
    return {
      cx: side * 0.25 * m,
      y: ROOT_TOP * m,
      rx: lerp(NECK_RADIUS, 0.25, m),
      rz: lerp(NECK_RADIUS, 0.4, m),
    };
  }
  const round = t > 0.92 ? Math.sqrt(Math.max(0, 1 - ((t - 0.92) / 0.08) ** 2)) : 1;
  return {
    cx: side * (0.25 + 0.2 * t),
    y: lerp(ROOT_TOP, ROOT_TIP, t),
    rx: lerp(0.25, 0.075, t ** 0.85) * round,
    rz: lerp(0.4, 0.1, t) * round,
  };
}

// Rows of a root from top to tip. Row 0 is a lip tucked up inside whatever sits on the gum line, so
// that no gap shows there; row 1 is the gum line.
const LIP = 0.02;
const ROOT_ROW_COUNT = NECK_ROWS + ROOT_ROWS + 2;
function rootRow(side: number, i: number) {
  if (i === 0) {
    const r = rootRing(side, -1);
    return { ...r, y: 2 * LIP, rx: r.rx - LIP, rz: r.rz - LIP };
  }
  return rootRing(side, i <= NECK_ROWS ? (i - 1) / NECK_ROWS - 1 : rootT(i - 1 - NECK_ROWS));
}

function root(side: number) {
  return surface(ROOT_ROW_COUNT, 48, (i, theta, out) => {
    const r = rootRow(side, i);
    out.set(r.cx + r.rx * Math.cos(theta), r.y, r.rz * Math.sin(theta));
  });
}

const merge = (parts: THREE.BufferGeometry[]) => {
  const merged = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  return merged;
};

export function buildTooth() {
  return {
    crown: revolve(crownProfile(), 96, { modifier: molar }),
    root: merge([root(1), root(-1)]),
  };
}

// --- Crown chapter: the tooth shaped to receive a crown, and the crown's two layers. ---

export function buildCrownParts() {
  const prep = [
    ...smooth(
      [
        [0, 0.83],
        [0.18, 0.83],
        [0.3, 0.77],
        [0.345, 0.66],
        [0.375, 0.4],
        [0.405, 0.14],
        [0.43, 0.075],
        [0.5, 0.06],
      ],
      30,
    ),
    ...poly([
      [0.5, 0.06],
      [0.5, 0],
    ]),
  ];

  // Metal layer: a thin shell over the prepared tooth, with a collar that stays visible at the gum.
  const coping = [
    ...smooth(
      [
        [0, 0.9],
        [0.2, 0.9],
        [0.345, 0.835],
        [0.41, 0.7],
        [0.445, 0.4],
        [0.468, 0.2],
      ],
      28,
    ),
    ...poly([
      [0.468, 0.2],
      [0.505, 0.15],
      [0.505, 0.065],
      [0.44, 0.085],
    ]),
    ...smooth(
      [
        [0.44, 0.085],
        [0.415, 0.15],
        [0.385, 0.4],
        [0.355, 0.665],
        [0.31, 0.78],
        [0.18, 0.842],
        [0, 0.842],
      ],
      24,
    ),
  ];

  // Porcelain layer: the tooth-shaped outside, hollowed to sit over the metal.
  const porcelain = [
    ...smooth([...CROWN.slice(0, 7), [0.65, 0.42], [0.59, 0.25], [0.53, 0.15]], 48, 1),
    ...poly([
      [0.53, 0.15],
      [0.51, 0.155],
      [0.474, 0.205],
    ]),
    ...smooth(
      [
        [0.474, 0.205],
        [0.452, 0.4],
        [0.417, 0.7],
        [0.351, 0.842],
        [0.2, 0.908],
        [0, 0.908],
      ],
      24,
    ),
  ];

  return {
    base: merge([revolve(prep, 64), root(1), root(-1)]),
    coping: revolve(coping, 64),
    porcelain: revolve(porcelain, 96, { modifier: molar }),
  };
}

// --- Root canal chapter: the tooth cut through the middle (the plane z = 0). ---

// The crown's outline where the cut plane meets it, from the top centre down to the gum line.
function outline(profile: P[], theta: number): XY[] {
  const tmp = { r: 0, y: 0 };
  const sign = Math.cos(theta) >= 0 ? 1 : -1;
  return profile.map((p) => {
    tmp.r = p.r;
    tmp.y = p.y;
    molar(tmp, p, theta);
    return [sign * tmp.r, tmp.y] as XY;
  });
}

// Enamel is thickest over the cusps and tapers to nothing at the gum line.
const underEnamel = ([x, y]: XY): XY => {
  const k = smoothstep(0.02, 0.4, y);
  return [x * (1 - 0.17 * k), y - 0.15 * k * smoothstep(0.75, 1.05, y)];
};

function rootOutline(side: number): XY[] {
  const outer: XY[] = [];
  const inner: XY[] = [];
  for (let i = 0; i < ROOT_ROW_COUNT; i++) {
    const r = rootRow(side, i);
    outer.push([r.cx + r.rx, r.y]);
    inner.push([r.cx - r.rx, r.y]);
  }
  return [...outer.slice(0, -1), ...inner.reverse()];
}

function canalOutline(side: number): XY[] {
  // Starts a little way up inside the pulp chamber, so the two join without a notch.
  const top = rootRing(side, 0);
  const outer: XY[] = [[top.cx + 0.075, top.y + 0.07]];
  const inner: XY[] = [[top.cx - 0.075, top.y + 0.07]];
  for (let i = 0; i <= 20; i++) {
    const t = (i / 20) * 0.96;
    const r = rootRing(side, t);
    const half = lerp(0.075, 0.018, t);
    outer.push([r.cx + half, r.y]);
    inner.push([r.cx - half, r.y]);
  }
  return [...outer, ...inner.reverse()];
}

// Pulp chamber: two horns reaching toward the cusps, narrowing to the two canal openings.
function chamberOutline(): XY[] {
  const points: XY[] = [
    [0.26, 0.52],
    [0.28, 0.2],
    [0.3, -0.1],
    [0.325, -0.3],
    [0.12, -0.24],
    [0, -0.2],
    [-0.12, -0.24],
    [-0.325, -0.3],
    [-0.3, -0.1],
    [-0.28, 0.2],
    [-0.26, 0.52],
    [-0.12, 0.34],
    [0, 0.38],
    [0.12, 0.34],
  ];
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    true,
  );
  return curve.getPoints(72).map((v) => [v.x, v.y] as XY);
}

// Flat shapes on the cut face. Each is built at z = 0; the scene stacks them slightly apart.
export function buildToothSection() {
  const crown = crownProfile();
  const right = outline(crown, 0);
  const left = outline(crown, Math.PI);
  const enamel = flat([...right, ...left.slice(1).reverse()]);

  // Above the gum line; below it the two roots are all there is.
  const dentin = merge([
    flat([...right.map(underEnamel), ...left.slice(1).reverse().map(underEnamel)]),
    flat(rootOutline(1)),
    flat(rootOutline(-1)),
  ]);

  // Pulp chamber plus both canals; also used for the emptied canals and for the sealing material.
  const pulp = merge([flat(chamberOutline()), flat(canalOutline(1)), flat(canalOutline(-1))]);

  // Opening made through the biting surface to reach the pulp.
  const nearCentre = ([x]: XY) => Math.abs(x) <= 0.2;
  const access = flat([
    ...left.filter(nearCentre).reverse(),
    ...right.filter(nearCentre).slice(1),
    [0.15, 0.36],
    [-0.15, 0.36],
  ]);

  return { enamel, dentin, pulp, access };
}

// The line a canal follows, used to guide the instrument. `side` may be anything from -1 to 1.
export function canalAxis(side: number, origin: THREE.Vector3, direction: THREE.Vector3) {
  const top = rootRing(side, 0);
  const tip = rootRing(side, 1);
  origin.set(top.cx, top.y, 0);
  direction.set(tip.cx - top.cx, tip.y - top.y, 0).normalize();
}

// Root canal file. The tip is at the origin and the handle is up the y axis.
export function buildFile() {
  const fluteTop = 1.9;
  const shaft = revolve(
    [
      ...poly([
        [0, 3.7],
        [0.034, 3.7],
        [0.034, fluteTop],
      ]),
      ...threadedRows(fluteTop, 0.05, 0.034, 0.013, 80),
      ...poly([
        [0.013, 0.05],
        [0, 0],
      ]),
    ],
    16,
    { modifier: thread(0.013, 0.12, fluteTop) },
  );
  const handle = revolve(
    poly([
      [0, 4.16],
      [0.085, 4.16],
      [0.1, 4.12],
      [0.1, 3.74],
      [0.085, 3.7],
      [0, 3.7],
    ]),
    24,
  );
  return { shaft, handle };
}

// --- Gum and bone around a natural tooth. ---

// The front of the core is removed so the roots can be seen. The two cut faces meet at an angle
// rather than in one flat plane: a single flat cut looks like a sheet of card from the front.
// NESTED leaves the faces angled toward the camera, so a whole tooth sits half-buried between them.
export const NESTED: Cut = { from: 18, to: 162 };
// BEHIND angles the faces away from the camera, so nothing covers a tooth that is cut at z = 0.
export const BEHIND: Cut = { from: -12, to: 192 };
const GUM_BASE = -0.4;

export function buildSocket(cut: Cut) {
  const top = smooth(
    [
      [0, 0],
      [0.5, 0],
      [0.56, 0],
      [0.66, -0.04],
      [0.85, -0.1],
      [CORE_RADIUS, -0.14],
    ],
    24,
  );
  const gum = tissue(
    [
      ...top,
      ...poly([
        [CORE_RADIUS, -0.14],
        [CORE_RADIUS, GUM_BASE],
      ]),
    ],
    [...top.map((p) => [p.r, p.y] as XY), [CORE_RADIUS, GUM_BASE], [0, GUM_BASE]],
    cut,
  );
  const boneLoop: XY[] = [
    [0, GUM_BASE],
    [CORE_RADIUS, GUM_BASE],
    [CORE_RADIUS, CORE_BOTTOM],
    [0, CORE_BOTTOM],
  ];
  const bone = tissue(poly(boneLoop.slice(1)), boneLoop, cut);
  return { gum, bone };
}
