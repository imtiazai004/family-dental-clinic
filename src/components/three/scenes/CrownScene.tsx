"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp01, ramp, smoothstep } from "@/lib/stage";
import { disposeTissue } from "../geometry";
import { PORCELAIN, ROOT, TissueMeshes } from "../materials";
import { buildCrownParts, buildSocket, NESTED } from "../parts/tooth";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

const ASSEMBLED: Shot = { y: -0.8, h: 5.2, w: 2.5, az: 0.26, el: 0.2 };
const WIDE: Shot = { y: 0.65, h: 8.1, w: 2.5, az: 0.32, el: 0.14 };
const PREP: Shot = { y: 0, h: 3.4, w: 2.5, az: 0.15, el: 0.16 };
const CAP: Shot = { y: 2.85, h: 3.6, w: 2, az: 0.42, el: 0.08 };

// Keep in step with the crown steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: ASSEMBLED },
  { p: 0.08, shot: ASSEMBLED },
  { p: 0.26, shot: WIDE },
  { p: 0.34, shot: WIDE },
  { p: 0.44, shot: PREP },
  { p: 0.52, shot: PREP },
  { p: 0.62, shot: CAP },
  { p: 0.7, shot: CAP },
  { p: 0.9, shot: ASSEMBLED },
  { p: 1, shot: ASSEMBLED },
];

// How far each layer of the crown travels when fully exploded.
const LIFT = { porcelain: 2.9, coping: 1.45 };

export default function CrownScene({ id, pores }: { id: string; pores: THREE.Texture }) {
  const geo = useMemo(() => ({ ...buildCrownParts(), ...buildSocket(NESTED) }), []);
  useEffect(
    () => () => {
      [geo.base, geo.coping, geo.porcelain].forEach((g) => g.dispose());
      disposeTissue(geo.gum);
      disposeTissue(geo.bone);
    },
    [geo],
  );

  const root = useRef<THREE.Group>(null);
  const porcelain = useRef<THREE.Group>(null);
  const coping = useRef<THREE.Group>(null);

  // Order matches the crown labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(
    () => [
      { part: porcelain, at: [0.95, 0.75, 0] },
      { part: coping, at: [0.7, 0.5, 0] },
      { part: root, at: [0.62, 0.45, 0] },
      { part: root, at: [0.6, -1.3, 0.2], textX: 1.3 },
    ],
    [],
  );

  useChapter(id, TRACK, anchors, ({ p, time, yaw, side }) => {
    const e = ramp(0.06, 0.26, p) * (1 - ramp(0.72, 0.9, p));

    // The porcelain leaves first and the metal follows; they return in reverse.
    const ePorcelain = ease(clamp01(e / 0.7));
    const eCoping = ease(clamp01((e - 0.3) / 0.7));
    porcelain.current!.position.y = LIFT.porcelain * ePorcelain;
    coping.current!.position.y = LIFT.coping * eCoping;

    root.current!.rotation.y = Math.sin(time * 0.5) * 0.18 * (1 - e) + yaw;

    return side ? smoothstep(0.8, 1, e) * (1 - smoothstep(0.34, 0.4, p)) : 0;
  });

  return (
    <group ref={root}>
      {/* The tooth is slightly wider than it is deep, like the crown in the implant chapter. */}
      <group scale={[1.05, 1, 0.95]}>
        <group ref={porcelain}>
          <mesh geometry={geo.porcelain}>
            <meshPhysicalMaterial {...PORCELAIN} />
          </mesh>
        </group>
        <group ref={coping}>
          <mesh geometry={geo.coping}>
            <meshStandardMaterial color="#d9b66c" metalness={1} roughness={0.3} />
          </mesh>
        </group>
        <mesh geometry={geo.base}>
          <meshStandardMaterial {...ROOT} />
        </mesh>
      </group>

      <TissueMeshes gum={geo.gum} bone={geo.bone} pores={pores} />
    </group>
  );
}
