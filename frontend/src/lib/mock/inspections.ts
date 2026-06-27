import { Inspection } from '@/types/inspection';

export const inspections: Inspection[] = [
  { id: 'INS-2024-0847', aircraftModel: 'Boeing 737-800', registrationNumber: 'N73742', tailNumber: 'N-737AB', type: 'engine_borescope', status: 'complete', date: '2025-06-12', inspector: 'J. Rivera', defectsFound: 3, maxSeverity: 'critical' },
  { id: 'INS-2024-0846', aircraftModel: 'Airbus A380-800', registrationNumber: '9V-SKA', tailNumber: 'B-A380C', type: 'airframe', status: 'complete', date: '2025-06-11', inspector: 'M. Patel', defectsFound: 0, maxSeverity: null },
  { id: 'INS-2024-0845', aircraftModel: 'Airbus A320neo', registrationNumber: 'D-AINY', tailNumber: 'N-320XD', type: 'full_inspection', status: 'complete', date: '2025-06-10', inspector: 'K. Okonkwo', defectsFound: 7, maxSeverity: 'major' },
  { id: 'INS-2024-0844', aircraftModel: 'Boeing 777-300ER', registrationNumber: 'A6-EPP', tailNumber: 'N-777EK', type: 'engine_borescope', status: 'complete', date: '2025-06-09', inspector: 'S. Chen', defectsFound: 2, maxSeverity: 'moderate' },
  { id: 'INS-2024-0843', aircraftModel: 'Boeing 737 MAX 8', registrationNumber: 'N8706U', tailNumber: 'N-7M8UA', type: 'landing_gear', status: 'complete', date: '2025-06-08', inspector: 'L. Schmidt', defectsFound: 1, maxSeverity: 'minor' },
  { id: 'INS-2024-0842', aircraftModel: 'Airbus A330-300', registrationNumber: 'F-WWYY', tailNumber: 'F-A333X', type: 'engine_borescope', status: 'in_progress', date: '2025-06-07', inspector: 'J. Rivera', defectsFound: 0, maxSeverity: null },
  { id: 'INS-2024-0841', aircraftModel: 'Embraer E190-E2', registrationNumber: 'PR-PJA', tailNumber: 'N-E190B', type: 'full_inspection', status: 'complete', date: '2025-06-06', inspector: 'M. Patel', defectsFound: 4, maxSeverity: 'major' },
  { id: 'INS-2024-0840', aircraftModel: 'Boeing 737-800', registrationNumber: 'VT-TGH', tailNumber: 'N-737CD', type: 'engine_borescope', status: 'complete', date: '2025-06-05', inspector: 'K. Okonkwo', defectsFound: 5, maxSeverity: 'critical' },
  { id: 'INS-2024-0839', aircraftModel: 'Airbus A320neo', registrationNumber: 'G-TTNA', tailNumber: 'G-320BA', type: 'airframe', status: 'failed', date: '2025-06-04', inspector: 'S. Chen', defectsFound: 0, maxSeverity: null },
  { id: 'INS-2024-0838', aircraftModel: 'Boeing 777-300ER', registrationNumber: 'JA731J', tailNumber: 'N-777JL', type: 'engine_borescope', status: 'complete', date: '2025-06-03', inspector: 'L. Schmidt', defectsFound: 2, maxSeverity: 'moderate' },
  { id: 'INS-2024-0837', aircraftModel: 'Airbus A380-800', registrationNumber: 'A6-EDB', tailNumber: 'A-380EK', type: 'full_inspection', status: 'complete', date: '2025-06-02', inspector: 'J. Rivera', defectsFound: 6, maxSeverity: 'major' },
  { id: 'INS-2024-0836', aircraftModel: 'Embraer E175', registrationNumber: 'N204NN', tailNumber: 'N-E175A', type: 'landing_gear', status: 'complete', date: '2025-06-01', inspector: 'M. Patel', defectsFound: 1, maxSeverity: 'minor' },
  { id: 'INS-2024-0835', aircraftModel: 'Boeing 737-800', registrationNumber: 'EI-FTP', tailNumber: 'N-737EF', type: 'engine_borescope', status: 'complete', date: '2025-05-30', inspector: 'K. Okonkwo', defectsFound: 3, maxSeverity: 'major' },
  { id: 'INS-2024-0834', aircraftModel: 'Airbus A320neo', registrationNumber: 'VT-WGA', tailNumber: 'N-320IN', type: 'engine_borescope', status: 'complete', date: '2025-05-28', inspector: 'S. Chen', defectsFound: 2, maxSeverity: 'moderate' },
  { id: 'INS-2024-0833', aircraftModel: 'Boeing 737 MAX 8', registrationNumber: 'LN-BKA', tailNumber: 'N-7M8NO', type: 'full_inspection', status: 'complete', date: '2025-05-26', inspector: 'L. Schmidt', defectsFound: 4, maxSeverity: 'critical' },
];
