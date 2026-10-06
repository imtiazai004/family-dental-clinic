"use client";

import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { advance, Canvas, createPortal, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { chapterView, stage } from "@/lib/stage";
import { boneTexture } from "./geometry";
import { FOV } from "./rig";

type SceneProps = { id: string; pores: THREE.Texture };

// One entry per chapter in content/chapters.ts, matched by id.
// Each scene is its own download, so a page only fetches the scenes it shows.
const SCENES: Record<string, ComponentType<SceneProps>> = {
  "dental-implant": lazy(() => import("./scenes/ImplantScene")),
  crown: lazy(() => import("./scenes/CrownScene")),
  "root-canal-treatment": lazy(() => import("./scenes/RootCanalScene")),
  "dental-veneers": lazy(() => import("./scenes/VeneersScene")),
  "dental-filling": lazy(() => import("./scenes/FillingScene")),
  "dental-bleaching": lazy(() => import("./scenes/BleachingScene")),
  braces: lazy(() => import("./scenes/BracesScene")),
  "complete-denture": lazy(() => import("./scenes/DentureScene")),
  "removable-partial-denture": lazy(() => import("./scenes/PartialDentureScene")),
  "tooth-extraction": lazy(() => import("./scenes/ExtractionScene")),
};

type View = { id: string; Scene: ComponentType<SceneProps>; scene: THREE.Scene; camera: THREE.PerspectiveCamera };

const MAX_DPR = 1.5;

// Horizontal drag turns the model. Vertical movement is left alone so the page still scrolls.
function useDragYaw() {
  useEffect(() => {
    const SPEED = 0.008;
    let lastX = 0;
    let lastY = 0;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !stage.active) return;
      if ((e.target as HTMLElement).closest("a, button")) return;
      stage.dragging = true;
      lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!stage.dragging || e.pointerType !== "mouse") return;
      stage.dragYaw += (e.clientX - lastX) * SPEED;
      lastX = e.clientX;
    };
    const release = () => {
      stage.dragging = false;
    };

    const touchStart = (e: TouchEvent) => {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    };
    const touchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      if (!stage.active || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      stage.dragging = true;
      stage.dragYaw += dx * SPEED;
    };

    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: true });
    window.addEventListener("touchend", release);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", release);
    };
  }, []);
}

// A chapter's scene lives in its own THREE.Scene with its own camera.
// It is only built once the visitor is getting close to it.
function ChapterPortal({ view, pores }: { view: View; pores: THREE.Texture }) {
  const [near, setNear] = useState(false);
  useFrame(() => {
    if (near) return;
    const bounds = stage.chapters[view.id];
    if (bounds && bounds.start - window.scrollY < window.innerHeight * 2.5) setNear(true);
  });

  return createPortal(
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 6]} intensity={1.5} />
      <directionalLight position={[-5, 2, -3]} intensity={0.8} color="#d9b8ff" />
      {near && (
        <Suspense fallback={null}>
          <view.Scene id={view.id} pores={pores} />
        </Suspense>
      )}
    </>,
    view.scene,
    { camera: view.camera },
  );
}

// Draws every chapter that is on screen. A chapter that is arriving or leaving is drawn shifted by
// the same number of pixels as its section in the page, so the model and its text travel together.
function DrawChapters({ views }: { views: View[] }) {
  useFrame(({ gl, size, scene }, dt) => {
    if (!stage.dragging) stage.dragYaw = THREE.MathUtils.damp(stage.dragYaw, 0, 1.5, dt);

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    gl.autoClear = false;
    gl.clear();
    for (const view of views) {
      const { visible, offset } = chapterView(view.id, scrollY, viewportHeight);
      if (!visible) continue;
      view.scene.environment = scene.environment;
      view.camera.aspect = size.width / size.height;
      view.camera.setViewOffset(size.width, size.height, 0, -offset, size.width, size.height);
      gl.clearDepth();
      gl.render(view.scene, view.camera);
    }
  }, 1);
  return null;
}

// `ids` are the chapters on this page, in page order.
export default function Experience({ ids }: { ids: string[] }) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, MAX_DPR));
  useDragYaw();

  const key = ids.join("|");
  const views = useMemo<View[]>(
    () =>
      key
        .split("|")
        .filter((id) => id in SCENES)
        .map((id) => ({
          id,
          Scene: SCENES[id],
          scene: new THREE.Scene(),
          camera: new THREE.PerspectiveCamera(FOV, 1, 1, 80),
        })),
    [key],
  );
  const pores = useMemo(() => boneTexture(), []);
  useEffect(() => () => pores.dispose(), [pores]);

  // Frames are driven from GSAP's ticker, after Lenis has applied the scroll for that frame,
  // so the canvas never draws a scroll position one frame behind the page.
  useEffect(() => {
    const tick = (time: number) => {
      if (stage.active) advance(time);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Stop drawing once the stage has scrolled out of view.
  useEffect(() => {
    const el = document.getElementById("stage");
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      stage.active = entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Canvas
      dpr={dpr}
      frameloop="never"
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, MAX_DPR))}
      />
      {/* Studio lighting built from panels — no HDR file to download. Shared by every chapter. */}
      <Environment resolution={256}>
        <color attach="background" args={["#3b2a44"]} />
        <Lightformer form="rect" intensity={3} position={[4, 5, 6]} scale={[7, 7, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} position={[-4, 2, 6]} scale={[5, 8, 1]} target={[0, 0, 0]} />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#e9c8ff"
          position={[-7, 1, -2]}
          scale={[4, 9, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer form="ring" intensity={2} position={[0, 9, 0]} scale={4} target={[0, 0, 0]} />
        <Lightformer
          form="rect"
          intensity={0.7}
          color="#ffd9c7"
          position={[0, -7, 3]}
          scale={[9, 4, 1]}
          target={[0, 0, 0]}
        />
      </Environment>
      {views.map((view) => (
        <ChapterPortal key={view.id} view={view} pores={pores} />
      ))}
      <DrawChapters views={views} />
    </Canvas>
  );
}
