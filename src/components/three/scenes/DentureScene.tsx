"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ramp, smoothstep } from "@/lib/stage";
import { GUM, PORCELAIN } from "../materials";
import { buildJawRidge, jawTeeth } from "../parts/denture";
import { buildIncisorCrown } from "../parts/incisor";
import { buildMolarCrown } from "../parts/tooth";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

// The denture is a horseshoe lying flat, so the camera looks down on it more than in other chapters.
const WHOLE: Shot = { y: 0, h: 3.6, w: 6.6, az: 0.5, el: 0.42 };
const WIDE: Shot = { y: 0.75, h: 5, w: 6.6, az: 0.6, el: 0.3 };
const TEETH: Shot = { y: 1.85, h: 2.6, w: 6.4, az: 0.3, el: 0.24 };
const BASE: Shot = { y: -0.2, h: 2.8, w: 6.4, az: 0.75, el: 0.5 };

// Keep in step with the complete denture steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: WHOLE },
  { p: 0.08, shot: WHOLE },
  { p: 0.26, shot: WIDE },
  { p: 0.34, shot: WIDE },
  { p: 0.44, shot: TEETH },
  { p: 0.52, shot: TEETH },
  { p: 0.62, shot: BASE },
  { p: 0.7, shot: BASE },
  { p: 0.9, shot: WHOLE },
  { p: 1, shot: WHOLE },
];

// How far the set of teeth rises off the base.
const LIFT = 1.5;
// How far into the base the teeth stand.
const SUNK = -0.06;

export default function DentureScene({ id }: { id: string }) {
  const geo = useMemo(() => ({ front: buildIncisorCrown(), back: buildMolarCrown(), base: buildJawRidge() }), []);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  const places = useMemo(() => jawTeeth(), []);

  const root = useRef<THREE.Group>(null);
  const teeth = useRef<THREE.Group>(null);

  // Order matches the complete denture labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(() => {
    const last = places[places.length - 1];
    return [
      { part: teeth, at: [last.x + 0.3, 0.4, last.z] },
      { part: root, at: [last.x + 0.48, -0.35, last.z] },
    ];
  }, [places]);

  useChapter(id, TRACK, anchors, ({ p, time, yaw, side }) => {
    const e = ramp(0.06, 0.26, p) * (1 - ramp(0.72, 0.9, p));
    teeth.current!.position.y = LIFT * ease(e);
    root.current!.rotation.y = Math.sin(time * 0.5) * 0.12 * (1 - e) + yaw;
    return side ? smoothstep(0.8, 1, e) * (1 - smoothstep(0.34, 0.4, p)) : 0;
  });

  return (
    <group ref={root}>
      <group ref={teeth}>
        {places.map((place, i) => (
          <mesh
            key={i}
            geometry={place.back ? geo.back : geo.front}
            position={[place.x, SUNK, place.z]}
            rotation-y={place.turn}
            scale={place.scale}
          >
            <meshPhysicalMaterial {...PORCELAIN} />
          </mesh>
        ))}
      </group>
      <mesh geometry={geo.base}>
        <meshPhysicalMaterial {...GUM} />
      </mesh>
    </group>
  );
}
