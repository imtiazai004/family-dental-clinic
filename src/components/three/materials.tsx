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
export const GUM = { color: "#e78f9b", roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 };

// For a surface that ends on a plane which has flat shapes drawn on it (the cut face of a tooth).
// Where such a surface meets the plane it is seen edge-on, and specks of it show through the flat
// shapes. This pushes it back in depth, most where it is most edge-on, so the flat shapes always win.
export const SUNK = { polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 };

// Gum and bone with their cut faces. `pores` is the shared spongy-bone texture.
// `sunk` is for a scene that draws on a plane these meet: see SUNK.
export function TissueMeshes({
  gum,
  bone,
  pores,
  sunk = false,
}: {
  gum: Tissue;
  bone: Tissue;
  pores: THREE.Texture;
  sunk?: boolean;
}) {
  const depth = sunk ? SUNK : null;
  return (
    <>
      <mesh geometry={gum.body}>
        <meshPhysicalMaterial {...GUM} {...depth} />
      </mesh>
      {gum.faces.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#d97c8a" roughness={0.6} side={THREE.DoubleSide} {...depth} />
        </mesh>
      ))}
      <mesh geometry={bone.body}>
        <meshStandardMaterial color="#eadbc0" roughness={0.85} {...depth} />
      </mesh>
      {bone.faces.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial map={pores} roughness={0.9} side={THREE.DoubleSide} {...depth} />
        </mesh>
      ))}
    </>
  );
}
