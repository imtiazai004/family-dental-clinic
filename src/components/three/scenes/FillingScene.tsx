"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ramp, smoothstep } from "@/lib/stage";
import { disposeTissue, halve } from "../geometry";
import { PORCELAIN, ROOT, SUNK, TissueMeshes } from "../materials";
import { BEHIND, buildCavitySection, buildSocket, buildTooth, buildToothSection } from "../parts/tooth";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

const ASSEMBLED: Shot = { y: -0.8, h: 5.2, w: 2.5, az: 0.26, el: 0.2 };
const SECTION: Shot = { y: -0.55, h: 4.5, w: 2.5, az: 0.08, el: 0.04 };
const CLOSE: Shot = { y: 0.6, h: 2.1, w: 2.3, az: 0.05, el: 0.05 };

// Keep in step with the filling steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: ASSEMBLED },
  { p: 0.06, shot: ASSEMBLED },
  { p: 0.18, shot: SECTION },
  { p: 0.28, shot: SECTION },
  { p: 0.36, shot: CLOSE },
  { p: 0.82, shot: CLOSE },
  { p: 0.95, shot: ASSEMBLED },
  { p: 1, shot: ASSEMBLED },
];

// The flat shapes on the cut face sit a hair apart so the later ones cover the earlier ones.
const Z = { enamel: 0.002, dentin: 0.004, pulp: 0.006, cavity: 0.008, layer: 0.01, decay: 0.018 };

// The filling goes in as three layers. Each is the whole cavity, kept below its own height; the
// lower ones are drawn over the higher. `at` is where in the chapter a layer starts to appear.
const LAYERS = [
  { top: 0.78, color: "#d9e0e8", at: 0.62 },
  { top: 0.92, color: "#e2e8ee", at: 0.68 },
  { top: 2, color: "#ebeff3", at: 0.74 },
];

export default function FillingScene({ id, pores }: { id: string; pores: THREE.Texture }) {
  const geo = useMemo(() => {
    const tooth = buildTooth();
    return {
      crown: halve(tooth.crown),
      root: halve(tooth.root),
      section: buildToothSection(),
      damage: buildCavitySection(),
      ...buildSocket(BEHIND),
    };
  }, []);
  useEffect(
    () => () => {
      [
        ...Object.values(geo.crown),
        ...Object.values(geo.root),
        ...Object.values(geo.section),
        ...Object.values(geo.damage),
      ].forEach((g) => g.dispose());
      disposeTissue(geo.gum);
      disposeTissue(geo.bone);
    },
    [geo],
  );

  // The tooth only ever turns about its upright axis, so a level plane stays where it is.
  const layerClips = useMemo(() => LAYERS.map((l) => [new THREE.Plane(new THREE.Vector3(0, -1, 0), l.top)]), []);

  const root = useRef<THREE.Group>(null);
  const tooth = useRef<THREE.Group>(null);
  const front = useRef<THREE.Group>(null);
  const frontCrown = useRef<THREE.MeshPhysicalMaterial>(null);
  const frontRoot = useRef<THREE.MeshStandardMaterial>(null);
  const decay = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const cavity = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const layers = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  // Order matches the filling labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(
    () => [
      // The text sits clear of the bone, where it is readable against the dark background.
      { part: tooth, at: [0.52, 1.12, 0.02], textX: 1.3 },
      { part: tooth, at: [0.1, 0.84, 0.02], textX: 1.3 },
      { part: tooth, at: [0.42, 0.45, 0.02], textX: 1.3 },
      { part: tooth, at: [0.12, 0.05, 0.02], textX: 1.3 },
    ],
    [],
  );

  useChapter(id, TRACK, anchors, ({ p, time, yaw, side }) => {
    // The front half of the tooth slides forward and fades, leaving the cut face in view.
    const open = ramp(0.06, 0.2, p) * (1 - ramp(0.86, 0.95, p));
    const frontOpacity = 1 - smoothstep(0.1, 0.9, open);
    front.current!.position.z = 0.9 * ease(open);
    front.current!.visible = frontOpacity > 0.01;
    frontCrown.current!.opacity = frontOpacity;
    frontRoot.current!.opacity = frontOpacity;

    root.current!.rotation.y = Math.sin(time * 0.5) * 0.18 * (1 - open) + yaw;

    // The decay is cleared, leaving a clean space, which is then filled from the floor up.
    cavity.current!.material.opacity = smoothstep(0.51, 0.56, p);
    cavity.current!.visible = p > 0.51;
    decay.current!.material.opacity = 1 - smoothstep(0.54, 0.6, p);
    decay.current!.visible = p < 0.6;
    LAYERS.forEach((layer, i) => {
      const material = layers.current[i]!;
      material.opacity = smoothstep(layer.at, layer.at + 0.05, p);
      material.visible = p > layer.at;
    });

    return side ? smoothstep(0.85, 1, open) * smoothstep(0.19, 0.23, p) * (1 - smoothstep(0.27, 0.31, p)) : 0;
  });

  return (
    <group ref={root}>
      <group ref={tooth} scale={[1.05, 1, 0.95]}>
        {/* Back half of the tooth, cut at z = 0. */}
        <mesh geometry={geo.crown.back}>
          <meshPhysicalMaterial {...PORCELAIN} {...SUNK} />
        </mesh>
        <mesh geometry={geo.root.back}>
          <meshStandardMaterial {...ROOT} {...SUNK} />
        </mesh>

        {/* The cut face. */}
        <mesh geometry={geo.section.enamel} position-z={Z.enamel}>
          <meshStandardMaterial color="#f7f3ea" roughness={0.7} />
        </mesh>
        <mesh geometry={geo.section.dentin} position-z={Z.dentin}>
          <meshStandardMaterial color="#edd9a6" roughness={0.8} />
        </mesh>
        <mesh geometry={geo.section.pulp} position-z={Z.pulp}>
          <meshStandardMaterial color="#e2607a" roughness={0.5} />
        </mesh>
        <mesh ref={cavity} geometry={geo.damage.cavity} position-z={Z.cavity}>
          <meshStandardMaterial color="#3a1c22" roughness={0.9} transparent />
        </mesh>
        {LAYERS.map((layer, i) => (
          <mesh key={layer.top} geometry={geo.damage.cavity} position-z={Z.layer + (LAYERS.length - i) * 0.002}>
            <meshStandardMaterial
              ref={(el) => {
                layers.current[i] = el;
              }}
              color={layer.color}
              roughness={0.5}
              transparent
              clippingPlanes={layerClips[i]}
            />
          </mesh>
        ))}
        <mesh ref={decay} geometry={geo.damage.decay} position-z={Z.decay}>
          <meshStandardMaterial color="#5b3a26" roughness={0.9} transparent />
        </mesh>

        {/* Front half, which moves away to open the tooth. */}
        <group ref={front}>
          <mesh geometry={geo.crown.front}>
            <meshPhysicalMaterial ref={frontCrown} {...PORCELAIN} transparent />
          </mesh>
          <mesh geometry={geo.root.front}>
            <meshStandardMaterial ref={frontRoot} {...ROOT} transparent />
          </mesh>
        </group>
      </group>

      <TissueMeshes gum={geo.gum} bone={geo.bone} pores={pores} sunk />
    </group>
  );
}
