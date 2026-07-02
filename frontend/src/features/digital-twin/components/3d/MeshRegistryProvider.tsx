import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { Mesh } from 'three';

type MeshRegistry = Map<string, Mesh>;

interface MeshRegistryContextValue {
  registerMesh: (name: string, mesh: Mesh) => void;
  getMesh: (name: string) => Mesh | undefined;
  getAllMeshes: () => MeshRegistry;
}

const MeshRegistryContext = createContext<MeshRegistryContextValue | undefined>(undefined);

export const MeshRegistryProvider = ({ children }: { children: ReactNode }) => {
  const registryRef = useRef<MeshRegistry>(new Map());

  const registerMesh = (name: string, mesh: Mesh) => {
    registryRef.current.set(name, mesh);
  };

  const getMesh = (name: string) => registryRef.current.get(name);
  const getAllMeshes = () => registryRef.current;

  return (
    <MeshRegistryContext.Provider value={{ registerMesh, getMesh, getAllMeshes }}>
      {children}
    </MeshRegistryContext.Provider>
  );
};

export const useMeshRegistry = () => {
  const context = useContext(MeshRegistryContext);
  if (!context) {
    throw new Error('useMeshRegistry must be used within a MeshRegistryProvider');
  }
  return context;
};
