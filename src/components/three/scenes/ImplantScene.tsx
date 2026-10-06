"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp01, ramp, smoothstep } from "@/lib/stage";
import { disposeTissue } from "../geometry";
import { PORCELAIN, TissueMeshes, TITANIUM } from "../materials";
import { buildImplant } from "../parts/implant";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

const ASSEMBLED: Shot = { y: -0.8, h: 5.2, w: 2.5, az: 0.3, el: 0.16 };
const WIDE: Shot = { y: 1.05, h: 8.8, w: 2.5, az: 0.45, el: 0.1 };
const CROWN: Shot = { y: 4.35, h: 2.7, w: 2.1, az: 0.2, el: 0.22 };
const ABUTMENT: Shot = { y: 1.93, h: 3.7, w: 1.8, az: 0.5, el: 0.1 };
const POST: Shot = { y: -1.55, h: 3.7, w: 2.5, az: 0.34, el: 0.06 };

// Keep in step with the implant steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: ASSEMBLED },
  { p: 0.08, shot: ASSEMBLED },
  { p: 0.28, shot: WIDE },
  { p: 0.36, shot: WIDE },
  { p: 0.45, shot: CROWN },
  { p: 0.51, shot: CROWN },
  { p: 0.6, shot: ABUTMENT },
  { p: 0.66, shot: ABUTMENT },
  { p: 0.75, shot: POST },
  { p: 0.81, shot: POST },
  { p: 0.93, shot: ASSEMBLED },
  { p: 1, shot: ASSEMBLED },
];

// How far each part travels when fully exploded.
const LIFT = { crown: 3.7, screw: 2.85, abutment: 1.3 };

export default function ImplantScene({ id, pores }: { id: string; pores: THREE.Texture }) {
  const geo = useMemo(() => buildImplant(), []);
  useEffect(
    () => () => {
      [geo.crown, geo.abutment, geo.screw, geo.fixture].forEach((g) => g.dispose());
      disposeTissue(geo.gum);
      disposeTissue(geo.bone);
    },
    [geo],
  );

  const root = useRef<THREE.Group>(null);
  const crown = useRef<THREE.Group>(null);
  const screw = useRef<THREE.Group>(null);
  const abutment = useRef<THREE.Group>(null);

  // Order matches the implant labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(
    () => [
      { part: crown, at: [0.95, 0.7, 0] },
      { part: screw, at: [0.3, 0.15, 0] },
      { part: abutment, at: [0.7, 0.3, 0] },
      { part: root, at: [1.3, -1.3, 0] },
      { part: root, at: [1.3, -2.5, 0] },
    ],
    [],
  );

  useChapter(id, TRACK, anchors, ({ p, time, yaw, side }) => {
    const e = ramp(0.06, 0.28, p) * (1 - ramp(0.81, 0.93, p));

    // Parts leave in order — crown, screw, abutment — and return in reverse.
    const eCrown = ease(clamp01(e / 0.6));
    const eScrew = ease(clamp01((e - 0.2) / 0.6));
    const eAbutment = ease(clamp01((e - 0.4) / 0.6));
    crown.current!.position.y = LIFT.crown * eCrown;
    screw.current!.position.y = LIFT.screw * eScrew;
    screw.current!.rotation.y = eScrew * Math.PI * 4;
    abutment.current!.position.y = LIFT.abutment * eAbutment;
    abutment.current!.rotation.y = eAbutment * Math.PI * 0.5;

    root.current!.rotation.y = Math.sin(time * 0.5) * 0.22 * (1 - e) + yaw;

    // Labels belong to the exploded overview only; they fade as the camera moves in on one part.
    return side ? smoothstep(0.8, 1, e) * (1 - smoothstep(0.36, 0.42, p)) : 0;
  });

  return (
    <group ref={root}>
      <group ref={crown}>
        <mesh geometry={geo.crown} scale={[1.05, 1, 0.95]}>
          <meshPhysicalMaterial {...PORCELAIN} />
        </mesh>
      </group>

      <group ref={screw}>
        <mesh geometry={geo.screw}>
          <meshStandardMaterial {...TITANIUM} roughness={0.28} />
        </mesh>
      </group>

      <group ref={abutment}>
        <mesh geometry={geo.abutment}>
          <meshStandardMaterial {...TITANIUM} />
        </mesh>
      </group>

      <mesh geometry={geo.fixture}>
        <meshStandardMaterial {...TITANIUM} roughness={0.42} />
      </mesh>

      <TissueMeshes gum={geo.gum} bone={geo.bone} pores={pores} />
    </group>
  );
}
