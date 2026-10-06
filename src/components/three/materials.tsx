"use client";

import * as THREE from "three";
import type { Tissue } from "./geometry";

// Looks shared by every chapter, so the same thing reads the same everywhere.
export const TITANIUM = { color: "#cfd2d8", metalness: 1, roughness: 0.34 };
export const PORCELAIN = {
  color: "#f4ede2",
  roughness: 0.24,
  clearcoat: 0.7,
  clearcoatRoughness: 0.25,
  sheen: 0.4,
  sheenColor: "#fff4e6",
};
export const ROOT = { color: "#e7d2a4", roughness: 0.6 };

// Gum and bone with their cut faces. `pores` is the shared spongy-bone texture.
export function TissueMeshes({ gum, bone, pores }: { gum: Tissue; bone: Tissue; pores: THREE.Texture }) {
  return (
    <>
      <mesh geometry={gum.body}>
        <meshPhysicalMaterial color="#e78f9b" roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} />
      </mesh>
      {gum.faces.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#d97c8a" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={bone.body}>
        <meshStandardMaterial color="#eadbc0" roughness={0.85} />
      </mesh>
      {bone.faces.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial map={pores} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}
