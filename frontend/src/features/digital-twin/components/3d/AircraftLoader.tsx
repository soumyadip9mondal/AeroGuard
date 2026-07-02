import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useMeshRegistry } from '@/features/digital-twin/components/3d/MeshRegistryProvider';
import { Group } from 'three';

// Ensure GLTF loaded as a group
interface AircraftGLTF extends Group {
  scene: Group;
}

const AircraftModel = ({ modelUrl }: { modelUrl: string }) => {
  const { scene } = useGLTF(modelUrl) as unknown as AircraftGLTF;

  // Register each mesh by its name
  const { registerMesh } = useMeshRegistry();

  React.useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as any).isMesh && obj.name) {
        registerMesh(obj.name, obj as any);
      }
    });
  }, [scene, registerMesh]);

  return <primitive object={scene} />;
};

export const AircraftLoader = ({ modelUrl }: { modelUrl?: string }) => {
  const url = modelUrl || process.env.NEXT_PUBLIC_AIRCRAFT_MODEL_URL || '/models/aircraft.glb';
  return (
    <Suspense fallback={<div className="text-center py-4">Loading aircraft model…</div>}>
      <AircraftModel modelUrl={url} />
    </Suspense>
  );
};

// Preload the model for faster load on navigation
useGLTF.preload(process.env.NEXT_PUBLIC_AIRCRAFT_MODEL_URL || '/models/aircraft.glb');
