import * as THREE from "three";
import { lerp, smoothstep } from "@/lib/stage";

// A point on a half cross-section: r = distance from the axis, y = height.
// `tag` is free for modifiers (e.g. thread strength).
export type P = { r: number; y: number; tag: number };
export type XY = [number, number];
export type Modifier = (out: { r: number; y: number }, p: P, theta: number) => void;

export const TAU = Math.PI * 2;

// Profiles run clockwise in the (r, y) plane — start at the top centre, go outward, then down —
// so that revolve() produces outward-facing normals.

// Straight segments with hard edges: interior points are doubled so each segment keeps its own normals.
export function poly(points: XY[], tag = 0): P[] {
  const out: P[] = [];
  points.forEach(([r, y], i) => {
    out.push({ r, y, tag });
    if (i > 0 && i < points.length - 1) out.push({ r, y, tag });
  });
  return out;
}

export function smooth(points: XY[], samples: number, tag = 0): P[] {
  const curve = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y)));
  return curve.getSpacedPoints(samples).map((v) => ({ r: Math.max(v.x, 0), y: v.y, tag }));
}

// A grid of rows × radial points wrapped around the vertical axis.
// Rows run top to bottom; `point` places row i at angle theta.
export function surface(
  rows: number,
  radial: number,
  point: (i: number, theta: number, out: THREE.Vector3) => void,
  phiStart = 0,
  phiLength = TAU,
): THREE.BufferGeometry {
  const closed = phiLength >= TAU - 1e-6;
  const cols = closed ? radial : radial + 1;

  const pos = new Float32Array(rows * cols * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      point(i, phiStart + (j / radial) * phiLength, v);
      pos.set([v.x, v.y, v.z], (i * cols + j) * 3);
    }
  }

  const index: number[] = [];
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const j1 = closed ? (j + 1) % radial : j + 1;
      const a = i * cols + j;
      const b = i * cols + j1;
      const c = (i + 1) * cols + j;
      const d = (i + 1) * cols + j1;
      index.push(a, b, c, b, d, c);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();

  // A row that collapses to a single point gets one shared normal.
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < rows; i++) {
    const a = i * cols * 3;
    if (Math.abs(pos[a] - pos[a + 3]) + Math.abs(pos[a + 2] - pos[a + 5]) > 1e-6) continue;
    v.set(0, 0, 0);
    for (let j = 0; j < cols; j++) {
      v.x += n.getX(i * cols + j);
      v.y += n.getY(i * cols + j);
      v.z += n.getZ(i * cols + j);
    }
    v.normalize();
    for (let j = 0; j < cols; j++) n.setXYZ(i * cols + j, v.x, v.y, v.z);
  }
  return g;
}

export function revolve(
  profile: P[],
  radial: number,
  opts: { modifier?: Modifier; phiStart?: number; phiLength?: number } = {},
): THREE.BufferGeometry {
  const { modifier, phiStart, phiLength } = opts;
  const tmp = { r: 0, y: 0 };
  return surface(
    profile.length,
    radial,
    (i, theta, out) => {
      tmp.r = profile[i].r;
      tmp.y = profile[i].y;
      if (modifier) modifier(tmp, profile[i], theta);
      out.set(tmp.r * Math.cos(theta), tmp.y, tmp.r * Math.sin(theta));
    },
    phiStart,
    phiLength,
  );
}

// Splits a shape built around the y axis into its back (z < 0) and front halves, for a scene that
// opens it along the plane z = 0. The halves are real geometry rather than one mesh clipped in two:
// a clipped mesh leaks specks of its surface through anything laid on the cut.
// Every revolve() and surface() here has a seam on that plane, so no triangle straddles it.
export function halve(g: THREE.BufferGeometry) {
  const z = g.attributes.position as THREE.BufferAttribute;
  const index = g.index!.array;
  const back: number[] = [];
  const front: number[] = [];
  for (let i = 0; i < index.length; i += 3) {
    const side = z.getZ(index[i]) + z.getZ(index[i + 1]) + z.getZ(index[i + 2]) < 0 ? back : front;
    side.push(index[i], index[i + 1], index[i + 2]);
  }
  const half = (triangles: number[]) => {
    const h = new THREE.BufferGeometry();
    h.setAttribute("position", g.attributes.position);
    h.setAttribute("normal", g.attributes.normal);
    h.setIndex(triangles);
    return h;
  };
  return { back: half(back), front: half(front) };
}

// A point on a line that runs level, and the level direction square to the line there. Seen from
// above, that direction must point to the right of the way the line is going.
export type PathPoint = { x: number; z: number; nx: number; nz: number };

// A rounded bar laid along a level line, such as a strip of gum. `path` takes t from 0 to 1.
// `round` is the share of the bar's length, at each end, over which it rounds off.
export function bar(
  path: (t: number) => PathPoint,
  shape: { top: number; bottom: number; halfThickness: number; round?: number },
  rows = 72,
): THREE.BufferGeometry {
  const { top, bottom, halfThickness, round = 0.05 } = shape;
  const middle = (top + bottom) / 2;
  const halfHeight = (top - bottom) / 2;
  // Squarer than an ellipse, so the top of the bar is level across most of its width.
  const bulge = (v: number) => Math.sign(v) * Math.sqrt(Math.abs(v));
  return surface(rows, 32, (i, theta, out) => {
    const t = i / (rows - 1);
    const fromEnd = Math.min(t, 1 - t);
    const end = fromEnd < round ? Math.sqrt(Math.max(0, 1 - (1 - fromEnd / round) ** 2)) : 1;
    const at = path(t);
    const across = halfThickness * end * bulge(Math.sin(theta));
    out.set(at.x + at.nx * across, middle + halfHeight * end * bulge(Math.cos(theta)), at.z + at.nz * across);
  });
}

// Flat shape in the x–y plane, facing +z.
export function flat(points: XY[], z = 0): THREE.BufferGeometry {
  const g = new THREE.ShapeGeometry(new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y))));
  if (z) g.translate(0, 0, z);
  return g;
}

const frac = (x: number) => x - Math.floor(x);

// Single-start helical thread: flat root, raised crest.
export function thread(depth: number, pitch: number, yStart: number): Modifier {
  return (out, p, theta) => {
    if (p.tag <= 0) return;
    const phase = frac((yStart - p.y) / pitch + theta / TAU);
    out.r += depth * p.tag * smoothstep(0.25, 1, 1 - Math.abs(2 * phase - 1));
  };
}

export function threadedRows(yTop: number, yBottom: number, rTop: number, rBottom: number, rows: number): P[] {
  const out: P[] = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    out.push({
      r: lerp(rTop, rBottom, t),
      y: lerp(yTop, yBottom, t),
      tag: smoothstep(0, 0.08, t) * (1 - smoothstep(0.9, 1, t)),
    });
  }
  return out;
}

// Molar crown: rounded-square outline plus four cusps separated by a cross-shaped fissure.
// Only touches points tagged 1, and fades out toward the gum line (y = 0).
export const molar: Modifier = (out, p, theta) => {
  if (p.tag <= 0) return;
  const n = 3;
  const squircle = Math.pow(Math.abs(Math.cos(theta)) ** n + Math.abs(Math.sin(theta)) ** n, -1 / n);
  out.r = p.r * (1 + (squircle - 1) * 0.9 * smoothstep(0, 0.5, p.y));
  // Cusps peak on the biting surface and soften toward the outer wall.
  const top = smoothstep(0.9, 1.15, p.y) * smoothstep(0.05, 0.36, p.r) * (1 - 0.6 * smoothstep(0.46, 0.66, p.r));
  const wave = -Math.cos(4 * theta);
  out.y = p.y + top * ((wave > 0 ? 0.1 : 0.06) * wave + 0.025 * Math.sin(theta + 0.6));
};

// Gum and bone are drawn as a core sample with part of it cut away, so what sits in the jaw is visible.
// x = r·cos θ, z = r·sin θ; the camera looks from +z.
export const CORE_RADIUS = 1.15;
export const CORE_BOTTOM = -3;

export type Cut = { from: number; to: number }; // degrees removed from the core
export type Tissue = { body: THREE.BufferGeometry; faces: THREE.BufferGeometry[] };

// `surface` is the outside of the tissue; `loop` is its closed cross-section, used for the two cut faces.
export function tissue(surfaceProfile: P[], loop: XY[], cut: Cut): Tissue {
  const from = THREE.MathUtils.degToRad(cut.from);
  const to = THREE.MathUtils.degToRad(cut.to);
  const body = revolve(surfaceProfile, 72, { phiStart: to, phiLength: TAU - (to - from) });
  const faces = [to, from + TAU].map((theta) => flat(loop).rotateY(-theta));
  return { body, faces };
}

export function disposeTissue(t: Tissue) {
  [t.body, ...t.faces].forEach((g) => g.dispose());
}

// Spongy-bone pattern for the cut faces. Seeded so it looks the same on every load.
export function boneTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f1e4cc";
  ctx.fillRect(0, 0, size, size);

  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 240; i++) {
    const x = random() * size;
    const y = random() * size;
    const rx = 3 + random() * 6;
    const ry = 2 + random() * 4;
    const turn = random() * Math.PI;
    ctx.fillStyle = `rgba(178, 140, 106, ${0.2 + random() * 0.3})`;
    // Draw each pore on every neighbouring tile too, so the texture repeats without seams.
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.ellipse(x + ox, y + oy, rx, ry, turn, 0, TAU);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
