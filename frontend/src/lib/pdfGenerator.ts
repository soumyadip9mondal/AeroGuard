import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DBJob, DBMetric } from '@/lib/api';

export function generatePDFReport(job: DBJob, metrics: DBMetric[]) {
  const doc = new jsPDF();
  const m = job.metadata || {};

  // Helper to safely get value or return '-'
  const val = (v: any) => v ? String(v) : '-';

  // --- Title & Header ---
  doc.setFontSize(22);
  doc.setTextColor(0, 51, 102);
  doc.text('AeroGuard Aviation', 14, 20);

  doc.setFontSize(16);
  doc.setTextColor(50, 50, 50);
  doc.text('Inspection Analysis Report', 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Job ID: ${job.id}`, 14, 38);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);
  doc.text(`File: ${job.originalFilename || '-'}`, 14, 50);

  // --- Aircraft Details ---
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Aircraft Details', 14, 65);

  autoTable(doc, {
    startY: 70,
    head: [['Property', 'Value']],
    body: [
      ['Registration Number', val(job.registrationNumber)],
      ['Aircraft Make', val(m.aircraftMake)],
      ['Aircraft Model', val(job.aircraftModel)],
      ['Airframe Serial Number', val(m.airframeSerialNumber)],
      ['Year of Manufacture', val(m.yearOfManufacture)],
      ['Inspection Type', val(job.inspectionType)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    margin: { left: 14 },
    tableWidth: 85,
  });

  // --- Powerplant & Lifespan ---
  autoTable(doc, {
    startY: 70,
    head: [['Property', 'Value']],
    body: [
      ['Engine Make', val(m.engineMake)],
      ['Engine Model', val(m.engineModel)],
      ['Engine Serial Number', val(m.engineSerialNumber)],
      ['Total Airframe Time (hrs)', val(m.totalAirframeTime)],
      ['Total Engine Hours (hrs)', val(m.totalEngineHours)],
      ['Propeller Make/Model', val(m.propellerMakeModel)],
      ['Propeller Serial Number', val(m.propellerSerialNumber)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    margin: { left: 110 },
    tableWidth: 85,
  });

  // --- Detected Defects ---
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY || 130;
  
  doc.setFontSize(14);
  doc.text('Detected Defects / Metrics', 14, finalY + 15);

  if (metrics.length === 0) {
    doc.setFontSize(11);
    doc.text('No defects detected.', 14, finalY + 25);
  } else {
    const tableData = metrics.map((d) => [
      d.id.slice(0, 8),
      d.metricType || '-',
      d.label || '-',
      `${(d.confidence || 0).toFixed(1)}%`,
      `Time: ${d.frameTimestampMs}ms`,
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Defect ID', 'Type', 'Label', 'Confidence', 'Location']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
    });
  }

  // --- Summary ---
  // @ts-ignore
  const finalY2 = doc.lastAutoTable ? doc.lastAutoTable.finalY : finalY + 30;
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Total findings: ${metrics.length}`, 14, finalY2 + 15);
  doc.text('End of Report.', 14, finalY2 + 25);

  doc.save(`AeroGuard_Report_${job.id.slice(0, 8)}.pdf`);
}
