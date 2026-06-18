export interface AircraftModel {
  id: string;
  manufacturer: 'Boeing' | 'Airbus' | 'Embraer';
  model: string;
  variant: string;
  engineType: string;
  maxFlightHours: number;
}

export interface Aircraft {
  id: string;
  modelId: string;
  tailNumber: string;
  registrationNumber: string;
  airline: string;
  totalFlightHours: number;
  lastInspection: string;
  healthScore: number;
  status: 'active' | 'maintenance' | 'grounded';
}
