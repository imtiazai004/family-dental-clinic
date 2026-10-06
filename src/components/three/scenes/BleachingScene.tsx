"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { smoothstep } from "@/lib/stage";
import { GUM, PORCELAIN } from "../materials";
import { archPlaces, buildGumArch } from "../parts/arch";
import { buildIncisorCrown } from "../parts/incisor";
import { useChapter, type Anchor, type Shot, type Track } from "../rig";

const OPEN: Shot = { y: 0.1, h: 3, w: 5.8, az: 0.42, el: 0.2 };
const FRONT: Shot = { y: 0.1, h: 3, w: 5.8, az: 0, el: 0.08 };
const END: Shot = { y: 0.1, h: 3, w: 5.8, az: -0.32, el: 0.16 };

// Keep in step with the bleaching steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: OPEN },
  { p: 0.08, shot: OPEN },
  { p: 0.28, shot: FRONT },
  { p: 0.78, shot: FRONT },
  { p: 0.92, shot: END },
  { p: 1, shot: END },
];

const DARKER = new THREE.Color("#d6b97c");
const LIGHTER = new THREE.Color("#f7f2e9");
// The lighter shade crosses the row from one side to the other: when the first tooth starts to
// change, how much later each next one does, and how long a tooth takes.
const SWEEP = { from: 0.3, step: 0.07, takes: 0.14 };

const NO_LABELS: Anchor[] = [];

export default function BleachingScene({ id }: { id: string }) {
  const geo = useMemo(() => ({ crown: buildIncisorCrown(), gum: buildGumArch() }), []);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  const places = useMemo(() => archPlaces(), []);

  const root = useRef<THREE.Group>(null);
  const teeth = useRef<(THREE.MeshPhysicalMaterial | null)[]>([]);

  useChapter(id, TRACK, NO_LABELS, ({ p, time, yaw }) => {
    places.forEach((_, i) => {
      const from = SWEEP.from + i * SWEEP.step;
      teeth.current[i]!.color.lerpColors(DARKER, LIGHTER, smoothstep(from, from + SWEEP.takes, p));
    });
    root.current!.rotation.y = Math.sin(time * 0.5) * 0.08 + yaw;
    return 0;
  });

  return (
    <group ref={root}>
      {places.map((place, i) => (
        // Each tooth stands a little way into the gum, so no gap shows at the gum line.
        <mesh
          key={i}
          geometry={geo.crown}
          position={[place.x, -0.04, place.z]}
          rotation-y={place.turn}
          scale={place.size}
        >
          <meshPhysicalMaterial
            ref={(el) => {
              teeth.current[i] = el;
            }}
            {...PORCELAIN}
          />
        </mesh>
      ))}
      <mesh geometry={geo.gum}>
        <meshPhysicalMaterial {...GUM} />
      </mesh>
    </group>
  );
}
