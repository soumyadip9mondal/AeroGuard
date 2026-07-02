import { useEffect } from 'react';
import { useInspectionStore } from '@/stores/inspection.store'; // existing store for detection data
import { useTwinStore } from '@/stores/twin.store';

/**
 * Hook that drives the Digital Twin integration.
 * It fetches the inspection result, registers mesh highlights, and subscribes to SSE updates.
 */
export const useDigitalTwinController = (inspectionId: string) => {
  const { setInspectionData, detections, jobId } = useInspectionStore();
  const { setHighlightedParts, setCameraTarget } = useTwinStore();

  // Helper to map detection parts to mesh names (assuming they match)
  const mapDetectionsToMeshes = (parts: { part: string }[]) =>
    parts.map((p) => p.part).filter(Boolean);

  // Load inspection data once
  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const res = await fetch(`/api/v1/inspections/${inspectionId}`);
        if (!res.ok) throw new Error('Failed to load inspection data');
        const data = await res.json();
        // Assuming backend returns shape matching InspectionResult interface
        setInspectionData(data);
        const meshNames = mapDetectionsToMeshes(data.parts ?? []);
        setHighlightedParts(meshNames);
      } catch (err) {
        console.error('DigitalTwinController: error loading inspection', err);
      }
    };
    fetchInspection();
  }, [inspectionId, setInspectionData, setHighlightedParts]);

  // Subscribe to SSE for live updates if a jobId exists
  useEffect(() => {
    if (!jobId) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const source = new EventSource(`${apiUrl}/api/v1/jobs/${jobId}/stream`);
    const handleMessage = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        // Expect payload to contain updated detections array
        if (payload.type === 'detections_update' && payload.detections) {
          setInspectionData({
            parts: payload.detections,
          });
          const meshNames = mapDetectionsToMeshes(payload.detections);
          setHighlightedParts(meshNames);
        }
        // Optional: camera target updates can be sent as separate events
        if (payload.type === 'focus_part' && payload.part) {
          setCameraTarget(payload.part);
        }
      } catch (err) {
        console.error('DigitalTwinController SSE parse error', err);
      }
    };
    source.addEventListener('message', handleMessage);
    source.onerror = (e) => {
      console.error('DigitalTwinController SSE error', e);
      source.close();
    };
    return () => {
      source.removeEventListener('message', handleMessage);
      source.close();
    };
  }, [jobId, setInspectionData, setHighlightedParts, setCameraTarget]);
};
