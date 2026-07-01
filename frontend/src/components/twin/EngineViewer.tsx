'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Defect } from '@/types/defect';
import { useTwinStore } from '@/stores/twin.store';

const severityColor: Record<string, string> = {
  critical: '#DC2626', major: '#EA580C', moderate: '#D97706', minor: '#16A34A',
};

/* Procedural engine */
function EngineCasing() {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.8, 2.6, 7, 32, 1, true]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 3.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.7, 0.15, 8, 32]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -3.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.12, 8, 32]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.6, 0.6, 8, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
        <meshStandardMaterial color="#3D3D3D" metalness={0.85} roughness={0.3} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * 1.6;
        const y = Math.sin(angle) * 1.6;
        return (
          <mesh key={i} position={[x, y, 3]} rotation={[0, 0, angle + Math.PI / 2]}>
            <boxGeometry args={[0.12, 1.6, 0.5]} />
            <meshStandardMaterial color="#5A5A5A" metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, -4.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[2.2, 1.5, 32]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* Procedural Fuselage */
function Fuselage() {
  return (
    <group>
      {/* Main body - Cylinder pointing along Z axis (from Z=-7.5 to Z=7.5) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 15, 32]} />
        <meshStandardMaterial color="#F3F4F6" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Nose - Half sphere at the front. Rotated so the dome points to +Z */}
      <mesh position={[0, 0, 7.5]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[2.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#F3F4F6" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Tail - Cone at the back. Rotated so tip points to -Z, base aligns at -7.5 */}
      <mesh position={[0, 0, -10.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[2.5, 6, 32]} />
        <meshStandardMaterial color="#F3F4F6" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, 2.5, -10.5]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color="#D1D5DB" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* Procedural Wing */
function Wing() {
  return (
    <group position={[0, 0, 0]}>
      {/* Center structural root */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 1.5, 8]} />
        <meshStandardMaterial color="#D1D5DB" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Right Wing */}
      <mesh position={[6, 0, -1]} rotation={[0, -0.1, -Math.PI / 32]}>
        <boxGeometry args={[12, 0.4, 4]} />
        <meshStandardMaterial color="#E5E7EB" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Left Wing */}
      <mesh position={[-6, 0, -1]} rotation={[0, 0.1, Math.PI / 32]}>
        <boxGeometry args={[12, 0.4, 4]} />
        <meshStandardMaterial color="#E5E7EB" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Winglet Right */}
      <mesh position={[12, 0.8, -1.2]} rotation={[0, 0, -Math.PI / 3]}>
        <boxGeometry args={[2, 0.2, 3.8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Winglet Left */}
      <mesh position={[-12, 0.8, -1.2]} rotation={[0, 0, Math.PI / 3]}>
        <boxGeometry args={[2, 0.2, 3.8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* Procedural Landing Gear */
function LandingGear() {
  return (
    <group position={[0, -1, 0]}>
      {/* Main Strut */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 6, 16]} />
        <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Axle */}
      <mesh position={[0, -1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 3, 16]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Wheel Left */}
      <mesh position={[-1.6, -1, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.5, 1.5, 0.8, 32]} />
        <meshStandardMaterial color="#1F2937" metalness={0.1} roughness={0.9} />
      </mesh>
      {/* Wheel Right */}
      <mesh position={[1.6, -1, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.5, 1.5, 0.8, 32]} />
        <meshStandardMaterial color="#1F2937" metalness={0.1} roughness={0.9} />
      </mesh>
    </group>
  );
}

/* Defect hotspot sphere */
function Hotspot({ defect, localIndex }: { defect: Defect, localIndex: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const { setSelectedDefect, selectedDefectId } = useTwinStore();
  const isSelected = selectedDefectId === defect.id;
  const color = severityColor[defect.severity] || '#D97706';

  // Use local index to distribute defects procedurally along the surface of the parts
  // Radius of the largest part is ~2.8, so we use 3.2 to keep hotspots visible on the outside.
  const radius = 3.2;
  const posX = defect.position3d.x + Math.sin(localIndex * 1.5) * radius;
  const posY = defect.position3d.y + Math.cos(localIndex * 1.5) * radius;
  const posZ = defect.position3d.z + (localIndex * 0.5 - 2);

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
      ref.current.scale.setScalar(isSelected ? 1.4 : s);
    }
  });

  return (
    <mesh
      ref={ref}
      position={[posX, posY, posZ]}
      onClick={(e) => { e.stopPropagation(); setSelectedDefect(defect.id); }}
    >
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 2 : 1} transparent opacity={0.9} />
    </mesh>
  );
}

/* Scene */
function Scene({ defects }: { defects: Defect[] }) {
  const { selectedDefectId } = useTwinStore();
  
  // Determine which part to render based on selected defect, or the first defect
  const activeDefect = useMemo(() => {
    if (selectedDefectId) {
      return defects.find(d => d.id === selectedDefectId) || defects[0];
    }
    return defects[0];
  }, [selectedDefectId, defects]);

  const partName = activeDefect?.section?.toLowerCase() || 'engine';
  
  // Filter defects that belong to the active part category so we only show relevant hotspots
  const activeDefects = useMemo(() => {
    return defects.filter(d => {
      const section = d.section?.toLowerCase() || 'engine';
      
      // If the part matches exactly, include it
      if (section === partName) return true;
      
      // Keep original fuzzy matching logic for airplane/wing/gear/engine
      if (partName.includes('airplane') || partName.includes('fuselage')) return section.includes('airplane') || section.includes('fuselage');
      if (partName.includes('wing')) return section.includes('wing');
      if (partName.includes('gear')) return section.includes('gear');
      
      // If it falls through and wasn't explicitly matched, default to showing it if it's an engine part,
      // OR if the active partName is an unrecognized part (like 'truck', 'bus')
      if (partName === 'truck' || partName === 'bus') return section === partName;
      
      return section.includes('engine') || section.includes('turbine') || section.includes('detection');
    });
  }, [defects, partName]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      
      {partName.includes('airplane') || partName.includes('fuselage') ? (
        <Fuselage />
      ) : partName.includes('wing') ? (
        <Wing />
      ) : partName.includes('gear') ? (
        <LandingGear />
      ) : (
        <EngineCasing />
      )}

      {activeDefects.map((d, i) => (
        <Hotspot key={d.id} defect={d} localIndex={i} />
      ))}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={25}
      />
      <Environment preset="city" />
    </>
  );
}

export default function EngineViewer({ defects }: { defects: Defect[] }) {
  return (
    <Canvas camera={{ position: [8, 4, 8], fov: 50 }} className="h-full w-full">
      <Scene defects={defects} />
    </Canvas>
  );
}
