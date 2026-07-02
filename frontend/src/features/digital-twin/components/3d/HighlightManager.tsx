import { useEffect, useRef } from 'react';
import { Mesh, MeshStandardMaterial, Color } from 'three';
import { useInspectionStore } from '@/stores/inspection.store';
import { useTwinStore } from '@/stores/twin.store';
import { useMeshRegistry } from '@/features/digital-twin/components/3d/MeshRegistryProvider';
import { useFrame } from '@react-three/fiber';

/**
 * HighlightManager applies visual emphasis to aircraft parts based on inspection detections.
 * It supports:
 *  - severity‑based emissive glow
 *  - pulse animation for non‑critical parts
 *  - flashing for CRITICAL severity
 *  - heatmap mode (shows all parts colored by severity intensity)
 *  - material caching & restoration to avoid memory leaks
 */
export const HighlightManager = () => {
  const { detections } = useInspectionStore();
  const {
    highlightedParts,
    heatmapMode,
    setHighlightedParts,
  } = useTwinStore();
  const { getMesh } = useMeshRegistry();

  // Cache reference to the original material for each mesh (do NOT clone now)
  const originalMaterials = useRef<Map<string, MeshStandardMaterial>>(new Map());
  // Store the temporary highlight materials we create so they can be disposed later
  const highlightMaterials = useRef<Set<MeshStandardMaterial>>(new Set());

  // Helper: map severity to emissive color
  const severityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return new Color(0xff0000); // bright red
      case 'High':
        return new Color(0xff6600); // orange
      case 'Medium':
        return new Color(0xffd500); // amber
      case 'Low':
        return new Color(0x00ff00); // green
      default:
        return new Color(0xffffff);
    }
  };

  // Build a lookup from part name to detection
  const detectionMap = detections.reduce((acc, d) => {
    if (d.class_name) acc[d.class_name] = d;
    return acc;
  }, {} as Record<string, any>);

  // Apply highlights whenever highlightedParts or heatmapMode changes
  useEffect(() => {
    // Cleanup any previous highlight materials
    highlightMaterials.current.forEach((mat) => mat.dispose());
    highlightMaterials.current.clear();

    // Determine which parts to highlight
    const partsToHighlight = heatmapMode
      ? Object.keys(detectionMap) // all detected parts in heatmap mode
      : highlightedParts;

    partsToHighlight.forEach((partName) => {
      const mesh = getMesh(partName) as Mesh;
      if (!mesh) return;
      const detection = detectionMap[partName];
      const severity = detection?.severity || 'Low';

      // Cache original material reference once (store the existing material without cloning)
      if (!originalMaterials.current.has(partName)) {
        const orig = mesh.material as MeshStandardMaterial;
        originalMaterials.current.set(partName, orig);
      }

      // Create a new material based on original
      const baseMaterial = originalMaterials.current.get(partName) as MeshStandardMaterial;
      const highlightMat = baseMaterial.clone();
      highlightMat.emissive = severityColor(severity);
      highlightMat.emissiveIntensity = heatmapMode ? 0.8 : 0.5;
      // For critical severity add a flashing flag via userData
      if (severity === 'Critical') {
        highlightMat.userData.isCritical = true;
      }
      mesh.material = highlightMat;
      highlightMaterials.current.add(highlightMat);
    });

    // Restore materials for parts that are no longer highlighted
    originalMaterials.current.forEach((_orig, partName) => {
      if (!partsToHighlight.includes(partName)) {
        const mesh = getMesh(partName) as Mesh;
        if (mesh) {
          const origMat = originalMaterials.current.get(partName);
          if (origMat) {
            // Restore the original material reference directly
            mesh.material = origMat;
          }
        }
      }
    });
  }, [highlightedParts, heatmapMode, detections, getMesh]);

  // Pulse animation (non‑critical) and flash (critical)
  useFrame((state, delta) => {
    highlightMaterials.current.forEach((mat) => {
      if (mat.userData.isCritical) {
        // Flash fast: toggle emissive intensity
        const speed = 6; // flashes per second
        mat.emissiveIntensity = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * speed)) * 0.5;
      } else {
        // Pulse slower for non‑critical
        const speed = 1; // pulses per second
        mat.emissiveIntensity = 0.4 + Math.abs(Math.sin(state.clock.elapsedTime * speed)) * 0.2;
      }
    });
  });

  // Cleanup on unmount: restore originals and dispose resources
  useEffect(() => {
    return () => {
      // Restore original materials and dispose only the temporary highlight materials
      originalMaterials.current.forEach((orig, partName) => {
        const mesh = getMesh(partName) as Mesh;
        if (mesh) {
          mesh.material = orig;
        }
      });
      // Dispose any highlight materials we created
      highlightMaterials.current.forEach((mat) => mat.dispose());
      originalMaterials.current.clear();
      highlightMaterials.current.clear();
    };
  }, []);

  return null; // This component only manipulates three.js objects
};
