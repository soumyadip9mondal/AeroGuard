import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useTwinStore } from '@/stores/twin.store';
import { useMeshRegistry } from '@/features/digital-twin/components/3d/MeshRegistryProvider';

/**
 * CameraController handles smooth camera transitions, auto‑focus on a selected mesh,
 * auto‑zoom based on mesh bounding box, and provides a reset capability.
 * It also integrates OrbitControls while preserving user interaction.
 */
export const CameraController = () => {
  const { camera, gl } = useThree();
  const { cameraTarget, setCameraTarget } = useTwinStore();
  const { getMesh } = useMeshRegistry();

  const targetPosRef = useRef<Vector3>(new Vector3());
  const isAnimatingRef = useRef(false);

  // When a new cameraTarget is set, compute the desired position and start animation
  useEffect(() => {
    if (!cameraTarget) return;
    const mesh = getMesh(cameraTarget);
    if (!mesh) return;

    // Compute mesh world position
    mesh.updateWorldMatrix(true, true);
    const worldPos = new Vector3();
    mesh.getWorldPosition(worldPos);

    // Determine a good distance based on mesh bounding sphere radius
    const box = mesh.geometry.boundingBox?.clone() ?? null;
    let distance = 5; // fallback
    if (box) {
      const size = box.getSize(new Vector3());
      const radius = Math.max(size.x, size.y, size.z) / 2;
      distance = radius * 3; // 3x radius away
    } else if (mesh.geometry.boundingSphere) {
      distance = mesh.geometry.boundingSphere.radius * 3;
    }

    // Desired camera position: offset along Z axis relative to mesh
    targetPosRef.current.copy(worldPos).add(new Vector3(0, 0, distance));
    isAnimatingRef.current = true;
  }, [cameraTarget, getMesh]);

  // Smooth interpolation each frame
  useFrame((state, delta) => {
    if (isAnimatingRef.current) {
      const currentPos = camera.position;
      currentPos.lerp(targetPosRef.current, Math.min(1, delta * 2)); // 2 units per second
      camera.lookAt(targetPosRef.current.clone().sub(new Vector3(0, 0, distanceFromCamera(currentPos, targetPosRef.current))));
      if (currentPos.distanceTo(targetPosRef.current) < 0.01) {
        // Snap and stop animating
        camera.position.copy(targetPosRef.current);
        camera.lookAt(targetPosRef.current.clone().sub(new Vector3(0, 0, distanceFromCamera(camera.position, targetPosRef.current))));
        isAnimatingRef.current = false;
        // Optionally clear target after focusing
        setCameraTarget(null);
      }
    }
  });

  // Helper to compute forward distance for lookAt offset (keep same Z offset)
  const distanceFromCamera = (camPos: Vector3, targetPos: Vector3) => {
    return camPos.distanceTo(targetPos);
  };

  // Reset camera to default view (called via external UI can set cameraTarget to "reset")
  useEffect(() => {
    if (cameraTarget === 'reset') {
      // Default position (adjust as needed for your scene)
      const defaultPos = new Vector3(0, 2, 8);
      targetPosRef.current.copy(defaultPos);
      isAnimatingRef.current = true;
      setCameraTarget(null);
    }
  }, [cameraTarget, setCameraTarget]);

  return <OrbitControls enableDamping={true} dampingFactor={0.1} rotateSpeed={0.5} />;
};
