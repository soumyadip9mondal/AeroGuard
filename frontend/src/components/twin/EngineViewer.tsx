'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, createPortal } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF, Decal } from '@react-three/drei';
import * as THREE from 'three';
import { Defect } from '@/types/defect';
import { useTwinStore } from '@/stores/twin.store';

const severityColor: Record<string, string> = {
  critical: '#DC2626', major: '#EA580C', moderate: '#D97706', minor: '#16A34A',
};

/* Scene */
function Scene({ defects, onComputed }: { defects: Defect[], onComputed?: (validIds: string[]) => void }) {
  const controlsRef = useRef<any>(null);
  const { setSelectedDefect, selectedDefectId } = useTwinStore();
  
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

    clone.updateMatrixWorld(true);
    
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

  // --- EXACT NDC CAMERA RAYCASTING PIPELINE ---
  const computedDefects = useMemo(() => {
    if (!clonedScene || defects.length === 0) return [];

    clonedScene.updateMatrixWorld(true);

    const raycaster = new THREE.Raycaster();
    const virtualCamera = new THREE.PerspectiveCamera(50, 1920 / 1080, 0.1, 1000);

    const results = [];

    for (const defect of defects) {
      if (!defect.ndc || !defect.cameraState) continue;

      // Map normalized drone coordinates to our scaled 3D model space
      const camPos = new THREE.Vector3(
        defect.cameraState.position[0] * boxSize.x * scale,
        defect.cameraState.position[1] * boxSize.y * scale,
        defect.cameraState.position[2] * boxSize.z * scale
      );
      const camLook = new THREE.Vector3(
        defect.cameraState.lookAt[0] * boxSize.x * scale,
        defect.cameraState.lookAt[1] * boxSize.y * scale,
        defect.cameraState.lookAt[2] * boxSize.z * scale
      );

      // Match virtual camera to drone's exact pose
      virtualCamera.position.copy(camPos);
      virtualCamera.lookAt(camLook);
      virtualCamera.updateMatrixWorld(true);

      // Raycast from this exact camera perspective through the NDC coordinates
      const pointer = new THREE.Vector2(defect.ndc.x, defect.ndc.y);
      raycaster.setFromCamera(pointer, virtualCamera);

      const intersects = raycaster.intersectObject(clonedScene, true);

      // Filter out propellers, glass, and invisible discs so rays hit the solid engine/fuselage
      const validIntersects = intersects.filter(hit => {
        const name = hit.object.name.toLowerCase();
        return !name.includes('prop') && !name.includes('blade') && !name.includes('glass') && !name.includes('window') && !name.includes('disc');
      });

      const bestHits = validIntersects.length > 0 ? validIntersects : intersects;

      if (bestHits.length > 0) {
        const hit = bestHits[0];
        const hitPoint = hit.point;
        
        // Transform the local face normal to world space
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
        const worldNormal = hit.face!.normal.clone().applyMatrix3(normalMatrix).normalize();
        
        // Convert world normal to Euler rotation for the Decal component
        const dummy = new THREE.Object3D();
        dummy.lookAt(worldNormal);
        const hitNormalEuler = new THREE.Euler(dummy.rotation.x, dummy.rotation.y, dummy.rotation.z);

        // Dynamically scale decal based on the bbox dimension approximation (making them a bit larger for visibility)
        const sX = Math.max(0.4, defect.dimensions.length / 30);
        const sY = Math.max(0.4, defect.dimensions.width / 30);

        results.push({
          defect,
          hitMesh: hit.object as THREE.Mesh,
          hitPoint,
          hitNormal: hitNormalEuler,
          scale: [sX, sY, 1.5] as [number, number, number], // Deep projection to avoid clipping
        });
      }
    }

    return results;
  }, [defects, clonedScene, boxSize, scale]);

  React.useEffect(() => {
    if (onComputed) {
      onComputed(computedDefects.map(item => item.defect.id));
    }
  }, [computedDefects, onComputed]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      
      <primitive object={clonedScene} />

      {/* Render Decals directly onto the intersected meshes using portals */}
      {computedDefects.map((item) => {
        const color = severityColor[item.defect.severity] || '#D97706';
        const isSelected = selectedDefectId === item.defect.id;
        
        return createPortal(
          <React.Fragment key={item.defect.id}>
            <Decal 
              position={item.hitPoint} 
              rotation={item.hitNormal} 
              scale={item.scale}
              onClick={(e) => { e.stopPropagation(); setSelectedDefect(item.defect.id); }}
            >
              <meshStandardMaterial 
                color={color} 
                emissive={color}
                emissiveIntensity={isSelected ? 1.5 : 0.5}
                polygonOffset 
                polygonOffsetFactor={-1} 
                transparent 
                opacity={0.9} 
                depthTest={true}
              />
            </Decal>
          </React.Fragment>,
          item.hitMesh
        );
      })}

      {/* Render HTML tooltips in world space to prevent double-transform from local mesh scaling */}
      {computedDefects.map((item) => {
        const isSelected = selectedDefectId === item.defect.id;
        if (!isSelected) return null;

        return (
          <Html key={`html-${item.defect.id}`} position={item.hitPoint.toArray()} center zIndexRange={[100, 0]}>
            <div className="flex flex-col items-center pointer-events-none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
              <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg border border-slate-700 flex flex-col items-center shadow-xl whitespace-nowrap">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.defect.type.replace(/_/g, ' ')}</span>
                <span className="text-[12px] font-mono font-medium">{item.defect.id}</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-900 mt-[-1px]"></div>
            </div>
          </Html>
        );
      })}
      
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

export default function EngineViewer({ defects, onComputed }: { defects: Defect[], onComputed?: (validIds: string[]) => void }) {
  return (
    <Canvas camera={{ position: [12, 8, 12], fov: 50 }} className="h-full w-full">
      <Scene defects={defects} onComputed={onComputed} />
    </Canvas>
  );
}

useGLTF.preload('/airplane.glb');
