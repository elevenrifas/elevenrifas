"use client";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function SpinningWireframe() {
  const ref = React.useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.6;
  });

  // Simple wireframe car silhouette made of line segments
  const pointsTop: [number, number, number][] = [
    [-1.8, 0.2, 0],
    [-1.2, 0.6, 0],
    [0.2, 0.6, 0],
    [0.9, 0.3, 0],
    [1.8, 0.2, 0],
  ];
  const pointsBody: [number, number, number][] = [
    [-2, 0, 0],
    [2, 0, 0],
  ];
  const wheelFront: [number, number, number][] = [
    [1.2, 0, 0],
    [1.2, -0.6, 0],
    [1.6, -0.6, 0],
    [1.6, 0, 0],
  ];
  const wheelBack: [number, number, number][] = [
    [-1.6, 0, 0],
    [-1.6, -0.6, 0],
    [-1.2, -0.6, 0],
    [-1.2, 0, 0],
  ];

  return (
    <group ref={ref}>
      <Line points={pointsTop} color="#ff0000" lineWidth={2} dashed={false} />
      <Line points={pointsBody} color="#ffffff" lineWidth={2} dashed={false} />
      <Line points={wheelFront} color="#ffffff" lineWidth={2} dashed />
      <Line points={wheelBack} color="#ffffff" lineWidth={2} dashed />
    </group>
  );
}

export function WireframeCarCanvas() {
  return (
    <div className="relative w-full h-[220px] sm:h-[280px]">
      <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0.6, 5]} fov={50} />
        <ambientLight intensity={0.2} />
        {/* Red rim light */}
        <directionalLight position={[2, 1, 3]} intensity={1.2} color="#ff0000" />
        <SpinningWireframe />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
    </div>
  );
}



