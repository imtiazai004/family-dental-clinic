"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ramp, smoothstep } from "@/lib/stage";
import { GUM, PORCELAIN } from "../materials";
import { archPlaces, buildGumArch, pushOut } from "../parts/arch";
import { bracketSeat, buildBracket, buildWire, poseTooth } from "../parts/braces";
import { buildIncisorCrown } from "../parts/incisor";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

const OPEN: Shot = { y: 0.1, h: 3, w: 5.8, az: 0.42, el: 0.2 };
const WIDE: Shot = { y: 0.3, h: 3.4, w: 7, az: 0.85, el: 0.2 };
const FRONT: Shot = { y: 0.2, h: 2.8, w: 5.8, az: 0, el: 0.1 };
const END: Shot = { y: 0.1, h: 3, w: 5.8, az: -0.32, el: 0.16 };

// Keep in step with the braces steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: OPEN },
  { p: 0.08, shot: OPEN },
  { p: 0.26, shot: WIDE },
  { p: 0.38, shot: WIDE },
  { p: 0.56, shot: FRONT },
  { p: 0.84, shot: FRONT },
  { p: 0.94, shot: END },
  { p: 1, shot: END },
];

// How far the parts travel when they come away from the teeth: outward, and for the wire also up, so
// that it does not hide the brackets.
const LIFT = { bracket: 0.6, wire: 1.2, wireUp: 0.55 };

export default function BracesScene({ id }: { id: string }) {
  const places = useMemo(() => archPlaces(), []);
  const geo = useMemo(() => {
    const wireFrom = buildWire(places, 0);
    return {
      crown: buildIncisorCrown(),
      gum: buildGumArch(),
      bracket: buildBracket(),
      wireFrom,
      wireTo: buildWire(places, 1),
      wire: wireFrom.clone(),
    };
  }, [places]);
  // One look for every bracket and the wire, so they can fade together when the braces come off.
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#dfe2e8", metalness: 0.7, roughness: 0.38, transparent: true }), []);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      metal.dispose();
    },
    [geo, metal],
  );
  const seats = useMemo(() => places.map(bracketSeat), [places]);

  const root = useRef<THREE.Group>(null);
  const teeth = useRef<(THREE.Group | null)[]>([]);
  const brackets = useRef<(THREE.Group | null)[]>([]);
  const wire = useRef<THREE.Group>(null);
  const bracket = useRef<THREE.Object3D | null>(null);
  const wireShape = useRef(-1);

  // Order matches the braces labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(() => {
    // The right-hand end of the wire, read from the wire itself.
    const at = new THREE.Vector3().fromBufferAttribute(geo.wireFrom.attributes.position, 7 * 138);
    return [
      { part: bracket, at: [0.16, 0, 0.06] },
      { part: wire, at: [at.x, at.y, at.z] },
    ];
  }, [geo]);

  useChapter(id, TRACK, anchors, ({ p, time, yaw, side }) => {
    // The brackets and wire come away to be looked at, and go back on.
    const apart = ease(ramp(0.08, 0.26, p) * (1 - ramp(0.4, 0.54, p)));
    // Then the teeth are brought into line, and at the end the braces come off for good.
    const straight = smoothstep(0.58, 0.82, p);
    const off = ease(ramp(0.88, 0.97, p));

    places.forEach((place, i) => {
      poseTooth(teeth.current[i]!, place, i, straight);
      brackets.current[i]!.position.z = seats[i].z + (LIFT.bracket * (apart + off)) / place.size;
    });
    pushOut(wire.current!, LIFT.wire * apart + LIFT.bracket * off);
    wire.current!.position.y = LIFT.wireUp * apart;
    metal.opacity = 1 - off;
    metal.visible = off < 1;

    // The wire bends with the teeth. Its shape only needs working out while they are moving.
    if (wireShape.current !== straight) {
      wireShape.current = straight;
      for (const name of ["position", "normal"] as const) {
        const now = geo.wire.attributes[name] as THREE.BufferAttribute;
        const from = geo.wireFrom.attributes[name].array;
        const to = geo.wireTo.attributes[name].array;
        for (let j = 0; j < from.length; j++) now.array[j] = from[j] + (to[j] - from[j]) * straight;
        now.needsUpdate = true;
      }
    }

    root.current!.rotation.y = Math.sin(time * 0.5) * 0.08 * (1 - apart) + yaw;

    return side ? smoothstep(0.8, 1, apart) * (1 - smoothstep(0.36, 0.42, p)) : 0;
  });

  return (
    <group ref={root}>
      {places.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            teeth.current[i] = el;
          }}
        >
          <mesh geometry={geo.crown}>
            <meshPhysicalMaterial {...PORCELAIN} />
          </mesh>
          <group
            ref={(el) => {
              brackets.current[i] = el;
              if (i === 5) bracket.current = el;
            }}
            position={[0, seats[i].y, seats[i].z]}
            scale={seats[i].scale}
          >
            <mesh geometry={geo.bracket} material={metal} />
          </group>
        </group>
      ))}
      <group ref={wire}>
        <mesh geometry={geo.wire} material={metal} />
      </group>
      <mesh geometry={geo.gum}>
        <meshPhysicalMaterial {...GUM} />
      </mesh>
    </group>
  );
}
