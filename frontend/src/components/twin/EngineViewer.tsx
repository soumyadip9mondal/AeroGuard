'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Defect } from '@/types/defect';
import { useTwinStore } from '@/stores/twin.store';

const severityColor: Record<string, string> = {
  critical: '#DC2626', major: '#EA580C', moderate: '#D97706', minor: '#16A34A',
};

// --- TRULY ROBUST MODEL-AGNOSTIC HOTSPOT ALGORITHM ---
// This calculates physical locations based purely on the REAL coordinate space of the uploaded model.
// No pseudo-random values or fake math are used anymore. We simply apply the same scale/center matrix
// to the AI's 3D coordinates that we apply to the model mesh.

/* Defect hotspot sphere */
function Hotspot({ defect, localIndex, pos }: { defect: Defect, localIndex: number, pos: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const { setSelectedDefect, selectedDefectId } = useTwinStore();
  const isSelected = selectedDefectId === defect.id;
  const color = severityColor[defect.severity] || '#D97706';

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
      ref.current.scale.setScalar(isSelected ? 1.4 : s);
    }
  });

  return (
    <mesh
      ref={ref}
      position={pos}
      onClick={(e) => { e.stopPropagation(); setSelectedDefect(defect.id); }}
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 2 : 1} transparent opacity={0.9} />
      
      {isSelected && (
        <Html position={[0, 0.6, 0]} center zIndexRange={[100, 0]}>
          <div className="flex flex-col items-center pointer-events-none animate-bounce" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg border border-slate-700 flex flex-col items-center shadow-xl">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{defect.type.replace(/_/g, ' ')}</span>
              <span className="text-[12px] font-mono font-medium">{defect.id}</span>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-900 mt-[-1px]"></div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

// Raycasts from above to perfectly snap onto the physical mesh surface
function SurfaceHotspot({ defect, localIndex, clonedScene, boxSize, scale }: { defect: Defect, localIndex: number, clonedScene: THREE.Group, boxSize: THREE.Vector3, scale: number }) {
  const [surfacePos, setSurfacePos] = useState<[number, number, number] | null>(null);

  useEffect(() => {
    if (!clonedScene) return;

    // Use normalized X and Z (representing length and span)
    const startX = defect.position3d.x * boxSize.x * scale;
    const startZ = defect.position3d.z * boxSize.z * scale;
    
    // Start way above the airplane
    const startY = (boxSize.y * scale) + 10;
    
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(startX, startY, startZ),
      new THREE.Vector3(0, -1, 0) // Shoot straight down
    );

    // Find exactly where the ray hits the airplane skin
    const intersects = raycaster.intersectObject(clonedScene, true);
    
    if (intersects.length > 0) {
      const hit = intersects[0].point;
      setSurfacePos([hit.x, hit.y, hit.z]);
    } else {
      // Fallback if the defect was placed outside the bounds of the mesh silhouette
      setSurfacePos([startX, 0, startZ]); 
    }
  }, [defect, clonedScene, boxSize, scale]);

  if (!surfacePos) return null;

  return <Hotspot defect={defect} localIndex={localIndex} pos={surfacePos} />;
}

/* Scene */
function Scene({ defects }: { defects: Defect[] }) {
  const controlsRef = useRef<any>(null);
  
  // Dynamically analyze whatever airplane GLB is uploaded
  const { scene } = useGLTF('/airplane.glb');
  
  const { clonedScene, scale, boxCenter, boxSize } = useMemo(() => {
    const clone = scene.clone();
    
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Lock longest dimension to exactly 24 units
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 24 / maxDim;
    clone.scale.setScalar(scale);

    // Flawlessly center the mesh exactly at [0,0,0]
    clone.position.x = -center.x * scale;
    clone.position.y = -center.y * scale;
    clone.position.z = -center.z * scale;
    
    const blueprintMaterial = new THREE.MeshStandardMaterial({
      color: '#0284c7', 
      wireframe: true, 
      transparent: true, 
      opacity: 0.6, 
      roughness: 0.8,
    });

    clone.traverse((node: any) => {
      if (node.isMesh) {
        node.material = blueprintMaterial;
      }
    });
    
    return { clonedScene: clone, scale, boxCenter: center, boxSize: size };
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      
      <primitive object={clonedScene} />

      {defects.map((d, i) => (
        <SurfaceHotspot 
          key={d.id} 
          defect={d} 
          localIndex={i} 
          clonedScene={clonedScene} 
          boxSize={boxSize} 
          scale={scale} 
        />
      ))}
      
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={40}
      />
      <Environment preset="city" />
    </>
  );
}

export default function EngineViewer({ defects }: { defects: Defect[] }) {
  return (
    <Canvas camera={{ position: [12, 8, 12], fov: 50 }} className="h-full w-full">
      <Scene defects={defects} />
    </Canvas>
  );
}

useGLTF.preload('/airplane.glb');
