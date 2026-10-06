import {
  CORE_BOTTOM,
  CORE_RADIUS,
  molar,
  poly,
  revolve,
  smooth,
  thread,
  threadedRows,
  tissue,
  type Cut,
  type XY,
} from "../geometry";

// Heights are in the assembled position: y = 0 is the gum line, the bone crest is at BONE_TOP.
const BONE_TOP = -0.35;

function crown() {
  const outer = smooth(
    [
      [0, 1.04],
      [0.16, 1.08],
      [0.34, 1.24],
      [0.5, 1.27],
      [0.62, 1.14],
      [0.67, 0.92],
      [0.685, 0.68],
      [0.65, 0.4],
      [0.57, 0.16],
      [0.51, 0.02],
    ],
    48,
    1,
  );
  const inner = poly([
    [0.51, 0.02],
    [0.47, 0],
    [0.4, 0.1],
    [0.31, 0.8],
    [0, 0.86],
  ]);
  return revolve([...outer, ...inner], 96, { modifier: molar });
}

function abutment() {
  const profile = [
    ...poly([
      [0, 0.42],
      [0.12, 0.42],
      [0.12, 0.86],
      [0.25, 0.86],
      [0.28, 0.83],
      [0.36, 0.14],
      [0.49, 0.03],
      [0.5, -0.02],
    ]),
    ...smooth(
      [
        [0.5, -0.02],
        [0.46, -0.12],
        [0.42, -0.24],
        [0.405, BONE_TOP],
      ],
      10,
    ),
    ...poly([
      [0.405, BONE_TOP],
      [0.2, BONE_TOP],
      [0.17, -0.9],
      [0, -0.9],
    ]),
  ];
  return revolve(profile, 64);
}

function screw() {
  const yThread = -0.05;
  const profile = [
    ...poly([
      [0, 0.56],
      [0.05, 0.56],
      [0.055, 0.62],
      [0.105, 0.62],
      [0.105, 0.44],
      [0.06, 0.4],
      [0.06, yThread],
    ]),
    ...threadedRows(yThread, -0.36, 0.06, 0.06, 56),
    ...poly([
      [0.06, -0.36],
      [0.04, -0.4],
      [0, -0.4],
    ]),
  ];
  return revolve(profile, 28, { modifier: thread(0.018, 0.055, yThread) });
}

function fixture() {
  const yThread = -0.62;
  const profile = [
    ...poly([
      [0, -0.95],
      [0.16, -0.95],
      [0.2, -0.38],
      [0.23, BONE_TOP],
      [0.4, BONE_TOP],
      [0.42, -0.37],
      [0.42, yThread],
    ]),
    ...threadedRows(yThread, -2.5, 0.41, 0.27, 130),
    ...smooth(
      [
        [0.27, -2.5],
        [0.24, -2.64],
        [0.14, -2.74],
        [0, -2.77],
      ],
      10,
    ),
  ];
  return revolve(profile, 72, { modifier: thread(0.075, 0.21, yThread) });
}

// A wedge is cut from the core, centred on the camera, so the post is visible in the jaw.
const WEDGE: Cut = { from: 20, to: 120 };

function gum() {
  const top = smooth(
    [
      [0.5, BONE_TOP],
      [0.5, -0.15],
      [0.508, -0.03],
      [0.545, 0],
      [0.63, -0.025],
      [0.82, -0.08],
      [CORE_RADIUS, -0.12],
    ],
    28,
  );
  const surfaceProfile = [
    ...top,
    ...poly([
      [CORE_RADIUS, -0.12],
      [CORE_RADIUS, BONE_TOP],
    ]),
  ];
  const loop: XY[] = [...top.map((p) => [p.r, p.y] as XY), [CORE_RADIUS, BONE_TOP]];
  return tissue(surfaceProfile, loop, WEDGE);
}

function bone() {
  const loop: XY[] = [
    [0, -2.8],
    [0.2, -2.72],
    [0.28, -2.5],
    [0.415, -0.62],
    [0.425, BONE_TOP],
    [CORE_RADIUS, BONE_TOP],
    [CORE_RADIUS, CORE_BOTTOM],
    [0, CORE_BOTTOM],
  ];
  return tissue(poly(loop), loop, WEDGE);
}

export function buildImplant() {
  return {
    crown: crown(),
    abutment: abutment(),
    screw: screw(),
    fixture: fixture(),
    gum: gum(),
    bone: bone(),
  };
}
