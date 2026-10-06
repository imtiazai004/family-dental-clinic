"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { lerp, ramp, smoothstep } from "@/lib/stage";
import { disposeTissue, TAU } from "../geometry";
import { PORCELAIN, ROOT, TissueMeshes } from "../materials";
import { BEHIND, buildFile, buildSocket, buildTooth, buildToothSection, canalAxis } from "../parts/tooth";
import { ease, useChapter, type Anchor, type Shot, type Track } from "../rig";

const ASSEMBLED: Shot = { y: -0.8, h: 5.2, w: 2.5, az: 0.26, el: 0.2 };
const SECTION: Shot = { y: -0.55, h: 4.5, w: 2.5, az: 0.08, el: 0.04 };
const WORK: Shot = { y: -0.2, h: 5.2, w: 2.5, az: -0.06, el: 0.04 };
const SEAL: Shot = { y: -0.7, h: 4.2, w: 2.5, az: 0.1, el: 0.03 };

// Keep in step with the root canal steps in content/chapters.ts.
const TRACK: Track = [
  { p: 0, shot: ASSEMBLED },
  { p: 0.06, shot: ASSEMBLED },
  { p: 0.18, shot: SECTION },
  { p: 0.34, shot: SECTION },
  { p: 0.42, shot: WORK },
  { p: 0.64, shot: WORK },
  { p: 0.7, shot: SEAL },
  { p: 0.84, shot: SEAL },
  { p: 0.95, shot: ASSEMBLED },
  { p: 1, shot: ASSEMBLED },
];

// The flat shapes on the cut face sit a hair apart so the later ones cover the earlier ones.
const Z = { enamel: 0.002, dentin: 0.004, empty: 0.006, fill: 0.008, pulp: 0.01, restoration: 0.012 };

const HEALTHY = new THREE.Color("#e2607a");
const INFECTED = new THREE.Color("#7d2a3a");
const EMPTY = "#3a1c22";

// Clipping planes in the tooth's own space; each frame they are moved to wherever the tooth is.
const KEEP_BACK = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
const KEEP_FRONT = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const keepBelow = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

// How far the file's tip is along a canal, measured from the canal opening (negative = above it).
const DEEP = 1.9;
const HOVER = -1.7;
const AWAY = -4.8;

// The file works down one canal, lifts out, crosses over, and does the other.
const pose = { depth: AWAY, side: 1 };
function filePose(p: number) {
  const working = (a: number, b: number) => DEEP - 0.4 * (0.5 - 0.5 * Math.cos(ramp(a, b, p) * TAU * 2));
  pose.side = p < 0.53 ? 1 : p < 0.55 ? lerp(1, -1, ease(ramp(0.53, 0.55, p))) : -1;
  if (p < 0.47) pose.depth = lerp(AWAY, DEEP, ease(ramp(0.4, 0.47, p)));
  else if (p < 0.5) pose.depth = working(0.47, 0.5);
  else if (p < 0.53) pose.depth = lerp(DEEP, HOVER, ease(ramp(0.5, 0.53, p)));
  else if (p < 0.55) pose.depth = HOVER;
  else if (p < 0.6) pose.depth = lerp(HOVER, DEEP, ease(ramp(0.55, 0.6, p)));
  else if (p < 0.63) pose.depth = working(0.6, 0.63);
  else pose.depth = lerp(DEEP, AWAY, ease(ramp(0.63, 0.68, p)));
  return pose;
}

const origin = new THREE.Vector3();
const direction = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export default function RootCanalScene({ id, pores }: { id: string; pores: THREE.Texture }) {
  const geo = useMemo(
    () => ({ ...buildTooth(), section: buildToothSection(), file: buildFile(), ...buildSocket(BEHIND) }),
    [],
  );
  useEffect(
    () => () => {
      [geo.crown, geo.root, geo.file.shaft, geo.file.handle, ...Object.values(geo.section)].forEach((g) =>
        g.dispose(),
      );
      disposeTissue(geo.gum);
      disposeTissue(geo.bone);
    },
    [geo],
  );

  const clip = useMemo(() => {
    const back = new THREE.Plane();
    const front = new THREE.Plane();
    const fill = new THREE.Plane();
    return { back, front, fill, backOnly: [back], frontOnly: [front], fillOnly: [fill] };
  }, []);

  const root = useRef<THREE.Group>(null);
  const tooth = useRef<THREE.Group>(null);
  const front = useRef<THREE.Group>(null);
  const frontCrown = useRef<THREE.MeshPhysicalMaterial>(null);
  const frontRoot = useRef<THREE.MeshStandardMaterial>(null);
  const pulp = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const access = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const fill = useRef<THREE.Mesh>(null);
  const restoration = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const file = useRef<THREE.Group>(null);
  const fileSpin = useRef<THREE.Group>(null);

  // Order matches the root canal labels in content/chapters.ts.
  const anchors = useMemo<Anchor[]>(
    () => [
      // The text sits clear of the bone, where it is readable against the dark background.
      { part: tooth, at: [0.6, 0.85, 0.02], textX: 1.3 },
      { part: tooth, at: [0.42, 0.3, 0.02], textX: 1.3 },
      { part: tooth, at: [0.12, 0.05, 0.02], textX: 1.3 },
      { part: tooth, at: [0.34, -1.3, 0.02], textX: 1.3 },
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

    // Pulp: healthy, then infected, then removed as the file works.
    pulp.current!.material.color.lerpColors(HEALTHY, INFECTED, smoothstep(0.27, 0.36, p));
    pulp.current!.material.opacity = 1 - smoothstep(0.45, 0.63, p);
    pulp.current!.visible = p < 0.63;
    access.current!.material.opacity = smoothstep(0.37, 0.41, p);
    access.current!.visible = p > 0.37;

    // Sealing material rises from the root tips, then the opening is closed.
    fill.current!.visible = p > 0.665;
    keepBelow.constant = lerp(-2.6, 0.6, ramp(0.67, 0.79, p));
    restoration.current!.material.opacity = smoothstep(0.79, 0.84, p);
    restoration.current!.visible = p > 0.79;

    const { depth, side: canal } = filePose(p);
    file.current!.visible = depth > AWAY + 0.02;
    canalAxis(canal, origin, direction);
    origin.addScaledVector(direction, depth);
    file.current!.position.set(origin.x * 1.05, origin.y, 0);
    file.current!.quaternion.setFromUnitVectors(UP, direction.negate());
    fileSpin.current!.rotation.y = p * 260;

    root.current!.updateWorldMatrix(true, true);
    clip.back.copy(KEEP_BACK).applyMatrix4(tooth.current!.matrixWorld);
    clip.front.copy(KEEP_FRONT).applyMatrix4(front.current!.matrixWorld);
    clip.fill.copy(keepBelow).applyMatrix4(tooth.current!.matrixWorld);

    return side ? smoothstep(0.85, 1, open) * smoothstep(0.19, 0.23, p) * (1 - smoothstep(0.33, 0.37, p)) : 0;
  });

  return (
    <group ref={root}>
      <group ref={tooth} scale={[1.05, 1, 0.95]}>
        {/* Back half of the tooth, cut at z = 0. */}
        <mesh geometry={geo.crown}>
          <meshPhysicalMaterial {...PORCELAIN} clippingPlanes={clip.backOnly} />
        </mesh>
        <mesh geometry={geo.root}>
          <meshStandardMaterial {...ROOT} clippingPlanes={clip.backOnly} />
        </mesh>

        {/* The cut face. */}
        <mesh geometry={geo.section.enamel} position-z={Z.enamel}>
          <meshStandardMaterial color="#f7f3ea" roughness={0.7} />
        </mesh>
        <mesh geometry={geo.section.dentin} position-z={Z.dentin}>
          <meshStandardMaterial color="#edd9a6" roughness={0.8} />
        </mesh>
        <mesh geometry={geo.section.pulp} position-z={Z.empty}>
          <meshStandardMaterial color={EMPTY} roughness={0.9} />
        </mesh>
        <mesh ref={access} geometry={geo.section.access} position-z={Z.empty}>
          <meshStandardMaterial color={EMPTY} roughness={0.9} transparent />
        </mesh>
        <mesh ref={fill} geometry={geo.section.pulp} position-z={Z.fill}>
          <meshStandardMaterial color="#f29a6b" roughness={0.6} clippingPlanes={clip.fillOnly} />
        </mesh>
        <mesh ref={pulp} geometry={geo.section.pulp} position-z={Z.pulp}>
          <meshStandardMaterial roughness={0.5} transparent />
        </mesh>
        <mesh ref={restoration} geometry={geo.section.access} position-z={Z.restoration}>
          <meshStandardMaterial color="#efe9dc" roughness={0.5} transparent />
        </mesh>

        {/* Front half, which moves away to open the tooth. */}
        <group ref={front}>
          <mesh geometry={geo.crown}>
            <meshPhysicalMaterial ref={frontCrown} {...PORCELAIN} clippingPlanes={clip.frontOnly} transparent />
          </mesh>
          <mesh geometry={geo.root}>
            <meshStandardMaterial ref={frontRoot} {...ROOT} clippingPlanes={clip.frontOnly} transparent />
          </mesh>
        </group>
      </group>

      <group ref={file} visible={false}>
        <group ref={fileSpin}>
          <mesh geometry={geo.file.shaft}>
            <meshStandardMaterial color="#d5d8de" metalness={1} roughness={0.3} />
          </mesh>
          <mesh geometry={geo.file.handle}>
            <meshStandardMaterial color="#2f6fdb" roughness={0.45} />
          </mesh>
        </group>
      </group>

      <TissueMeshes gum={geo.gum} bone={geo.bone} pores={pores} />
    </group>
  );
}
