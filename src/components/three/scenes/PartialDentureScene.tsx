"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp01, ramp, smoothstep } from "@/lib/stage";
import { GUM, PORCELAIN, TITANIUM } from "../materials";
import { buildJawRidge, buildPartial, FRAME_OUT, jawTeeth, MISSING, onJaw, type JawTooth } from "../parts/denture";
import { buildIncisorCrown } from "../parts/incisor";
import { buildMolarCrown } from "../parts/tooth";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

// The jaw is a horseshoe lying flat, so the camera looks down on it more than in other chapters.
const WHOLE: Shot = { y: 0, h: 3.6, w: 6.6, az: 0.5, el: 0.42 };
const WIDE: Shot = { y: 1.45, h: 5.6, w: 6.6, az: 0.6, el: 0.25 };
const FRAME: Shot = { y: 1.2, h: 2.8, w: 6.4, az: 0.8, el: 0.5 };
const TEETH: Shot = { y: 2.75, h: 3, w: 6.4, az: 0.35, el: 0.3 };

// Keep in step with the removable partial denture steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: WHOLE },
  { p: 0.08, shot: WHOLE },
  { p: 0.26, shot: WIDE },
  { p: 0.34, shot: WIDE },
  { p: 0.44, shot: FRAME },
  { p: 0.52, shot: FRAME },
  { p: 0.62, shot: TEETH },
  { p: 0.7, shot: TEETH },
  { p: 0.9, shot: WHOLE },
  { p: 1, shot: WHOLE },
];

// How far each part of the denture rises off the jaw when it is fully apart.
const LIFT = { frame: 1.3, bases: 2.1, teeth: 2.9 };
// How far into the gum, or into the denture's base, a tooth stands.
const SUNK = -0.06;
// The top of the denture's base is this far above the gum it sits on.
const BASE_TOP = 0.1;
// The denture's own pink, a shade apart from the gum.
const BASE_PINK = "#d97787";

export default function PartialDentureScene({ id }: { id: string }) {
  const places = useMemo(() => jawTeeth(), []);
  const geo = useMemo(
    () => ({ front: buildIncisorCrown(), back: buildMolarCrown(), gum: buildJawRidge(), ...buildPartial(places) }),
    [places],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const root = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Group>(null);
  const bases = useRef<THREE.Group>(null);
  const teeth = useRef<THREE.Group>(null);

  // Order matches the removable partial denture labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(() => {
    const last = places[13];
    const held = places[10];
    // The frame is pointed out near the front, where it is in plain view; its text sits clear of the jaw.
    const bar = onJaw(places[8].along, FRAME_OUT);
    return [
      { part: teeth, at: [last.x + 0.3, 0.5, last.z] },
      { part: bases, at: [last.x + 0.5, -0.2, last.z] },
      { part: frame, at: [held.x + 0.32, 0.3, held.z] },
      { part: frame, at: [bar.x, -0.46, bar.z + 0.06], textX: last.x + 1 },
    ];
  }, [places]);

  useChapter(id, TRACK, anchors, ({ p, time, yaw, side }) => {
    const e = ramp(0.06, 0.26, p) * (1 - ramp(0.72, 0.9, p));
    // The whole denture comes off the jaw first; then its parts come away from one another.
    const off = ease(clamp01(e / 0.6));
    const apart = ease(clamp01((e - 0.4) / 0.6));
    frame.current!.position.y = LIFT.frame * off;
    bases.current!.position.y = LIFT.frame * off + (LIFT.bases - LIFT.frame) * apart;
    teeth.current!.position.y = LIFT.frame * off + (LIFT.teeth - LIFT.frame) * apart;

    root.current!.rotation.y = Math.sin(time * 0.5) * 0.12 * (1 - e) + yaw;
    return side ? smoothstep(0.8, 1, e) * (1 - smoothstep(0.34, 0.4, p)) : 0;
  });

  const tooth = (place: JawTooth, i: number, y: number) => (
    <mesh
      key={i}
      geometry={place.back ? geo.back : geo.front}
      position={[place.x, y, place.z]}
      rotation-y={place.turn}
      scale={place.scale}
    >
      <meshPhysicalMaterial {...PORCELAIN} />
    </mesh>
  );

  return (
    <group ref={root}>
      {/* The jaw: the gum, and the teeth that are still there. */}
      {places.map((place, i) => (MISSING.includes(i) ? null : tooth(place, i, SUNK)))}
      <mesh geometry={geo.gum}>
        <meshPhysicalMaterial {...GUM} />
      </mesh>

      {/* The denture, in its three parts. */}
      <group ref={frame}>
        <mesh geometry={geo.frame}>
          <meshStandardMaterial {...TITANIUM} />
        </mesh>
        <mesh geometry={geo.clasps}>
          <meshStandardMaterial {...TITANIUM} />
        </mesh>
      </group>
      <group ref={bases}>
        <mesh geometry={geo.bases}>
          <meshPhysicalMaterial {...GUM} color={BASE_PINK} />
        </mesh>
      </group>
      <group ref={teeth}>{MISSING.map((i) => tooth(places[i], i, BASE_TOP + SUNK))}</group>
    </group>
  );
}
