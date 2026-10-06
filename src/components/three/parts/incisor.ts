import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { lerp, smoothstep } from "@/lib/stage";
import { surface } from "../geometry";

// A front tooth with one root. y = 0 is the gum line, where the enamel ends.
// The face seen in a smile looks along +z; the tooth is widest along x.
export const INCISOR_NECK = 0.36;
const HEIGHT = 1.45;
const ROOT_TIP = -2.55;
// The part of the crown, measured in q, over which the biting edge rounds off.
const EDGE = 0.3;

// How far the front and the back of the crown stand from the tooth's axis, at height fraction u.
// The front is gently rounded; the back swells near the gum and is scooped out above that.
const frontAt = (u: number) => lerp(0.1, INCISOR_NECK, (1 - u) ** 0.9) + 0.05 * Math.sin(Math.PI * u);
const backAt = (u: number) =>
  lerp(0.1, INCISOR_NECK, (1 - u) ** 1.6) + 0.07 * Math.sin(Math.PI * Math.min(1, 2 * u)) ** 2;

// One point on the crown. q runs from 0 at the biting edge to 1 at the gum line, and is bunched
// toward the edge so its rounding stays smooth. The crown is a wedge: round at the gum line, then
// wider and thinner on the way up. Each slice is one rounded shape, set forward or back as a whole,
// so that its two sides are rounded alike.
function crownPoint(q: number, theta: number, out: THREE.Vector3) {
  const u = 1 - q * q;
  const edge = Math.sin((Math.PI / 2) * Math.min(1, q / EDGE));
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const halfWidth = (INCISOR_NECK + 0.17 * smoothstep(0, 0.75, u)) * (0.9 + 0.1 * edge);
  const front = frontAt(u);
  const back = backAt(u);
  // Round at the gum line, squarer toward the edge.
  const k = 2 / (2 + 0.9 * smoothstep(0, 0.5, u));
  out.set(
    halfWidth * Math.sign(c) * Math.abs(c) ** k,
    HEIGHT * u,
    edge * ((front - back) / 2 + ((front + back) / 2) * Math.sign(s) * Math.abs(s) ** k),
  );
}

// Where the middle of the crown's front face is, at height y. For things that sit on that face.
export const incisorFront = (y: number) => frontAt(y / HEIGHT);

const CROWN_ROWS = 56;
const ROOT_ROWS = 40;
// The root's first row is a lip tucked up inside the crown, so that no gap shows at the gum line.
const LIP = 0.02;

export const buildIncisorCrown = () =>
  surface(CROWN_ROWS, 64, (i, theta, out) => crownPoint(i / (CROWN_ROWS - 1), theta, out));

export function buildIncisor() {
  const crown = buildIncisorCrown();
  const root = surface(ROOT_ROWS + 2, 48, (i, theta, out) => {
    if (i === 0) {
      out.set((INCISOR_NECK - LIP) * Math.cos(theta), 2 * LIP, (INCISOR_NECK - LIP) * Math.sin(theta));
      return;
    }
    // Rows bunch up toward the tip so its rounded end stays smooth.
    const t = 1 - (1 - (i - 1) / ROOT_ROWS) ** 1.5;
    const round = t > 0.92 ? Math.sqrt(Math.max(0, 1 - ((t - 0.92) / 0.08) ** 2)) : 1;
    out.set(
      lerp(INCISOR_NECK, 0.09, t ** 0.85) * round * Math.cos(theta),
      lerp(0, ROOT_TIP, t),
      lerp(INCISOR_NECK, 0.11, t) * round * Math.sin(theta),
    );
  });
  return { crown, root };
}

// --- Veneers chapter: a thin shell over the front face of the crown. ---

// The shell covers the front from just short of the gum line up onto the biting edge, and reaches
// round both corners. It is thickest in the middle and thins to almost nothing at its border.
const VENEER = { qTop: 0.06, qBottom: 0.965, from: 0.08 * Math.PI, to: 0.92 * Math.PI };
const VENEER_THICKNESS = 0.055;
// How far the shell's inside stands off the tooth, so the two never flicker through each other.
const VENEER_GAP = 0.006;

export function buildVeneer() {
  const rows = 48;
  const cols = 40;
  const along = new THREE.Vector3();
  const down = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const D = 1e-3;

  const shell = (thickness: number) =>
    surface(
      rows,
      cols,
      (i, theta, out) => {
        const fq = i / (rows - 1);
        const ft = (theta - VENEER.from) / (VENEER.to - VENEER.from);
        const q = lerp(VENEER.qTop, VENEER.qBottom, fq);
        crownPoint(q, theta, out);
        crownPoint(q, theta + D, along);
        crownPoint(q + D, theta, down);
        normal.crossVectors(along.sub(out), down.sub(out)).normalize();
        const taper =
          smoothstep(0, 0.14, ft) * smoothstep(0, 0.14, 1 - ft) * smoothstep(0, 0.1, fq) * smoothstep(0, 0.08, 1 - fq);
        out.addScaledVector(normal, VENEER_GAP + thickness * (0.08 + taper));
      },
      VENEER.from,
      VENEER.to - VENEER.from,
    );

  // Outside and inside. Drawn two-sided, so the inside shows when the shell is seen from behind.
  const parts = [shell(VENEER_THICKNESS), shell(0)];
  const veneer = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  return veneer;
}
