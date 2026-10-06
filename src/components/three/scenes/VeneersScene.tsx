"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ramp, smoothstep } from "@/lib/stage";
import { disposeTissue } from "../geometry";
import { PORCELAIN, ROOT, TissueMeshes } from "../materials";
import { buildIncisor, buildVeneer, INCISOR_NECK } from "../parts/incisor";
import { buildSocket, NESTED } from "../parts/tooth";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

// The shell comes off toward the front, so once it is off the camera moves round to the side.
const ASSEMBLED: Shot = { y: -0.8, h: 5.2, w: 2.5, az: 0.26, el: 0.2 };
const WIDE: Shot = { y: -0.5, h: 5.7, w: 2.8, az: -0.65, el: 0.14 };
const SHELL: Shot = { y: 0.95, h: 2.7, w: 3.6, az: -1.15, el: 0.1 };
const FRONT: Shot = { y: 0.95, h: 2.7, w: 3.5, az: -0.8, el: 0.12 };

// Keep in step with the veneers steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: ASSEMBLED },
  { p: 0.08, shot: ASSEMBLED },
  { p: 0.26, shot: WIDE },
  { p: 0.34, shot: WIDE },
  { p: 0.44, shot: SHELL },
  { p: 0.52, shot: SHELL },
  { p: 0.62, shot: FRONT },
  { p: 0.7, shot: FRONT },
  { p: 0.9, shot: ASSEMBLED },
  { p: 1, shot: ASSEMBLED },
];

// How far the shell travels when it is fully off: forward, and a little up.
const LIFT = { z: 1.3, y: 0.55 };

// The tooth under the shell is a shade darker than the shell.
const NATURAL = "#dccb9c";

export default function VeneersScene({ id, pores }: { id: string; pores: THREE.Texture }) {
  const geo = useMemo(() => ({ ...buildIncisor(), veneer: buildVeneer(), ...buildSocket(NESTED, INCISOR_NECK) }), []);
  useEffect(
    () => () => {
      [geo.crown, geo.root, geo.veneer].forEach((g) => g.dispose());
      disposeTissue(geo.gum);
      disposeTissue(geo.bone);
    },
    [geo],
  );

  const root = useRef<THREE.Group>(null);
  const veneer = useRef<THREE.Group>(null);

  // Order matches the veneers labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(
    () => [
      { part: veneer, at: [0.45, 0.95, 0.3] },
      { part: root, at: [0.25, 0.3, 0.31] },
      { part: root, at: [0.2, -1.3, 0.2], textX: 1.3 },
    ],
    [],
  );

  useChapter(id, TRACK, anchors, ({ p, time, yaw, side }) => {
    const e = ramp(0.06, 0.26, p) * (1 - ramp(0.72, 0.9, p));
    const eased = ease(e);
    veneer.current!.position.set(0, LIFT.y * eased, LIFT.z * eased);

    root.current!.rotation.y = Math.sin(time * 0.5) * 0.18 * (1 - e) + yaw;

    return side ? smoothstep(0.8, 1, e) * (1 - smoothstep(0.34, 0.4, p)) : 0;
  });

  return (
    <group ref={root}>
      <group ref={veneer}>
        <mesh geometry={geo.veneer}>
          <meshPhysicalMaterial {...PORCELAIN} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh geometry={geo.crown}>
        <meshPhysicalMaterial {...PORCELAIN} color={NATURAL} />
      </mesh>
      <mesh geometry={geo.root}>
        <meshStandardMaterial {...ROOT} />
      </mesh>

      <TissueMeshes gum={geo.gum} bone={geo.bone} pores={pores} />
    </group>
  );
}
