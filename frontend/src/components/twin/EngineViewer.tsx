'use client';

import { useRef } from 'react';
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
      {/* Outer casing */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.8, 2.6, 7, 32, 1, true]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Front ring */}
      <mesh position={[0, 0, 3.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.7, 0.15, 8, 32]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Rear ring */}
      <mesh position={[0, 0, -3.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.12, 8, 32]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Inner core shaft */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.6, 0.6, 8, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Fan disk */}
      <mesh position={[0, 0, 3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
        <meshStandardMaterial color="#3D3D3D" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Fan blades */}
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
      {/* Exhaust cone */}
      <mesh position={[0, 0, -4.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[2.2, 1.5, 32]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* Defect hotspot sphere */
function Hotspot({ defect }: { defect: Defect }) {
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
      position={[defect.position3d.x, defect.position3d.y, defect.position3d.z]}
      onClick={(e) => { e.stopPropagation(); setSelectedDefect(defect.id); }}
    >
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 2 : 1} transparent opacity={0.9} />
    </mesh>
  );
}

/* Scene */
function Scene({ defects }: { defects: Defect[] }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} />
      <EngineCasing />
      {defects.map((d) => (
        <Hotspot key={d.id} defect={d} />
      ))}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={4}
        maxDistance={18}
      />
      <Environment preset="city" />
    </>
  );
}

export default function EngineViewer({ defects }: { defects: Defect[] }) {
  return (
    <Canvas camera={{ position: [6, 3, 6], fov: 50 }} className="h-full w-full">
      <Scene defects={defects} />
    </Canvas>
  );
}
