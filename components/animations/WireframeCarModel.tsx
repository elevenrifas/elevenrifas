"use client";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Center, useGLTF, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { WireframeCarCanvas as SimpleWireframe } from "@/components/animations/WireframeCar";

function CarEdges({ url = "/models/car-simplified.glb" }: { url?: string }) {
  const { scene } = useGLTF(url);
  const edgesGroup = React.useMemo(() => {
    const group = new THREE.Group();
    scene.traverse((obj) => {
      const mesh = obj as unknown as THREE.Mesh;
      if ((mesh as { isMesh?: boolean }).isMesh && mesh.geometry) {
        // Black fill (body)
        const bodyMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const body = new THREE.Mesh(mesh.geometry, bodyMat);
        const pos = (mesh as unknown as { position?: THREE.Vector3 }).position;
        const rot = (mesh as unknown as { rotation?: THREE.Euler }).rotation;
        const scl = (mesh as unknown as { scale?: THREE.Vector3 }).scale;
        if (pos) body.position.copy(pos);
        if (rot) body.rotation.copy(rot);
        if (scl) body.scale.copy(scl);
        body.renderOrder = 0;
        group.add(body);

        // White edges overlay
        const geo = new THREE.EdgesGeometry(mesh.geometry, 12);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        const lines = new THREE.LineSegments(geo, lineMat);
        const linePos = (mesh as unknown as { position?: THREE.Vector3 }).position;
        const lineRot = (mesh as unknown as { rotation?: THREE.Euler }).rotation;
        const lineScl = (mesh as unknown as { scale?: THREE.Vector3 }).scale;
        if (linePos) lines.position.copy(linePos);
        if (lineRot) lines.rotation.copy(lineRot);
        if (lineScl) lines.scale.copy(lineScl);
        group.add(lines);
      }
    });
    return group;
  }, [scene]);

  return <primitive object={edgesGroup} />;
}

function SpinningCar() {
  const ref = React.useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });

  return (
    <Center>
      {/* Horizontal perfectly; camera eye-level */}
      <group rotation={[0, 0, 0]} scale={0.6}>
        <group ref={ref}>
          <CarEdges />
        </group>
      </group>
    </Center>
  );
}

export function WireframeCarCanvasPro() {
  // Prefer simple wireframe on low-power devices or very small screens
  const preferSimple = false; // forzar modelo edges en el Hero
  return (
    <div className="relative w-full h-[220px] sm:h-[280px]">
      {!preferSimple ? (
        <React.Suspense fallback={<SimpleWireframe />}> 
          <Canvas gl={{ antialias: true, powerPreference: "high-performance", alpha: true, stencil: false, depth: true }} dpr={[1, 1]}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={32} />
            <ambientLight intensity={0.25} />
            <directionalLight position={[2, 1, 3]} intensity={1.3} color="#ff0000" />
            <AdaptiveDpr pixelated />
            <SpinningCar />
          </Canvas>
        </React.Suspense>
      ) : (
        <SimpleWireframe />
      )}
      {/* No overlay; canvas es totalmente transparente */}
    </div>
  );
}

useGLTF.preload("/models/car-simplified.glb");


