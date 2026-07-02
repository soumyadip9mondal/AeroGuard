export interface Part {
  id: string;
  partNumber: string;
  name: string;
  category?: string;
  availableQty: number;
  reservedQty: number;
  warehouseId?: string;
  shelfLocation?: string;
  supplierId?: string;
  compatibleAircraft?: string[];
  // additional fields as needed
}

export interface PartsResponse {
  data: Part[];
  total: number;
}
