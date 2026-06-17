export interface Report {
  id: string;
  inspectionId: string;
  tailNumber: string;
  title: string;
  type: 'compliance' | 'executive' | 'detailed';
  date: string;
  format: 'PDF' | 'XLSX' | 'CSV';
  size: string;
  complianceRefs: string[];
}
