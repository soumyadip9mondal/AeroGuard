export const kpiData = {
  aircraftInspected: 1247,
  defectsDetected: 3891,
  criticalFindings: 23,
  fleetHealthScore: 94.2,
  openWorkOrders: 47,
  maintenanceCost: 2340000,
  deltas: {
    aircraftInspected: 12.3,
    defectsDetected: -3.1,
    criticalFindings: -8.7,
    fleetHealthScore: 2.1,
    openWorkOrders: -15.2,
    maintenanceCost: 4.8,
  },
};

export const defectTrendData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 5, i + 1);
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    minor: Math.floor(Math.random() * 8) + 2,
    moderate: Math.floor(Math.random() * 5) + 1,
    major: Math.floor(Math.random() * 3),
    critical: Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0,
  };
});

export const fleetHealthData = [
  { aircraft: 'Boeing 737-800', healthScore: 96.1, inspections: 342, lastInspected: '2025-06-12' },
  { aircraft: 'Airbus A320neo', healthScore: 93.4, inspections: 289, lastInspected: '2025-06-10' },
  { aircraft: 'Boeing 777-300ER', healthScore: 91.8, inspections: 156, lastInspected: '2025-06-09' },
  { aircraft: 'Airbus A380-800', healthScore: 88.7, inspections: 98, lastInspected: '2025-06-11' },
  { aircraft: 'Airbus A330-300', healthScore: 94.5, inspections: 201, lastInspected: '2025-06-07' },
  { aircraft: 'Embraer E190-E2', healthScore: 97.2, inspections: 134, lastInspected: '2025-06-06' },
];

export const riskMatrixData = [
  { component: 'Fan Blade', minor: 12, moderate: 7, major: 4, critical: 2 },
  { component: 'Compressor Blade', minor: 8, moderate: 5, major: 3, critical: 1 },
  { component: 'Turbine Blade', minor: 6, moderate: 9, major: 5, critical: 3 },
  { component: 'Combustion Liner', minor: 3, moderate: 4, major: 2, critical: 1 },
  { component: 'Nozzle Guide Vane', minor: 5, moderate: 6, major: 3, critical: 0 },
  { component: 'Seal', minor: 14, moderate: 3, major: 1, critical: 0 },
  { component: 'Bearing', minor: 4, moderate: 2, major: 1, critical: 1 },
  { component: 'Casing', minor: 7, moderate: 4, major: 2, critical: 0 },
];
