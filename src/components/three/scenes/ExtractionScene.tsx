"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ramp, smoothstep } from "@/lib/stage";
import { disposeTissue } from "../geometry";
import { PORCELAIN, ROOT, TissueMeshes } from "../materials";
import { buildEmptySocket, buildSocket, buildTooth, NESTED } from "../parts/tooth";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

const ASSEMBLED: Shot = { y: -0.8, h: 5.2, w: 2.5, az: 0.26, el: 0.2 };
const CROWN: Shot = { y: 0.4, h: 3, w: 2.5, az: 0.1, el: 0.28 };
const WIDE: Shot = { y: 0.85, h: 8.3, w: 2.5, az: 0.32, el: 0.14 };
const SOCKET: Shot = { y: -1.1, h: 4.4, w: 2.5, az: 0.2, el: 0.3 };

// Keep in step with the tooth extraction steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: ASSEMBLED },
  { p: 0.1, shot: ASSEMBLED },
  { p: 0.34, shot: CROWN },
  { p: 0.46, shot: CROWN },
  { p: 0.62, shot: WIDE },
  { p: 0.78, shot: WIDE },
  { p: 0.92, shot: SOCKET },
  { p: 1, shot: SOCKET },
];

// How far the tooth rises: enough to bring the tips of its roots clear of the gum.
const LIFT = 3.4;

export default function ExtractionScene({ id, pores }: { id: string; pores: THREE.Texture }) {
  const geo = useMemo(() => ({ ...buildTooth(), ...buildSocket(NESTED), empty: buildEmptySocket(NESTED) }), []);
  useEffect(
    () => () => {
      [geo.crown, geo.root, geo.empty.faces, geo.empty.mouth].forEach((g) => g.dispose());
      disposeTissue(geo.gum);
      disposeTissue(geo.bone);
    },
    [geo],
  );
  // Drawn just in front of the gum and bone it lies on.
  const hollow = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8d6f70",
        roughness: 1,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [],
  );
  useEffect(() => () => hollow.dispose(), [hollow]);

  const root = useRef<THREE.Group>(null);
  const tooth = useRef<THREE.Group>(null);
  const crown = useRef<THREE.MeshPhysicalMaterial>(null);
  const roots = useRef<THREE.MeshStandardMaterial>(null);

  // Order matches the tooth extraction labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(
    () => [
      { part: tooth, at: [0.72, 0.6, 0] },
      { part: root, at: [0.38, -1, 0.13], textX: 1.3 },
      { part: root, at: [1.3, -2.5, 0] },
    ],
    [],
  );

  useChapter(id, TRACK, anchors, ({ p, time, yaw, side }) => {
    // The tooth rises out of its socket, turning a little as it comes. It does not go back.
    const out = ease(ramp(0.48, 0.66, p));
    tooth.current!.position.y = LIFT * out;
    tooth.current!.rotation.y = 0.5 * out;
    // Once it is out, it fades, and the socket is what is left to look at.
    const gone = smoothstep(0.82, 0.9, p);
    tooth.current!.visible = gone < 1;
    crown.current!.opacity = roots.current!.opacity = 1 - gone;

    root.current!.rotation.y = Math.sin(time * 0.5) * 0.18 * (1 - out) + yaw;

    return side ? smoothstep(0.64, 0.68, p) * (1 - smoothstep(0.78, 0.82, p)) : 0;
  });

  return (
    <group ref={root}>
      <group ref={tooth}>
        <mesh geometry={geo.crown}>
          <meshPhysicalMaterial ref={crown} {...PORCELAIN} transparent />
        </mesh>
        <mesh geometry={geo.root}>
          <meshStandardMaterial ref={roots} {...ROOT} transparent />
        </mesh>
      </group>

      <mesh geometry={geo.empty.faces} material={hollow} />
      <mesh geometry={geo.empty.mouth} material={hollow} />
      <TissueMeshes gum={geo.gum} bone={geo.bone} pores={pores} />
    </group>
  );
}
