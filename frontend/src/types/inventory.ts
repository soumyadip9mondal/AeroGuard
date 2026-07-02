export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled' | 'requested';

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  aircraftModel?: string;
  ataChapter?: string;
  category?: string;
  manufacturer?: string;
  serialNumber?: string;
  compatibleAircraft?: string[];
  warehouseId?: string;
  shelfLocation?: string;
  availableQty: number;
  reservedQty: number;
  minStock?: number;
  maxStock?: number;
  unitCost?: number;
  leadTimeDays?: number;
  supplierId?: string;
  barcode?: string;
  qrCodeUrl?: string;
  imageUrl?: string;
  lifecycleStatus?: string;
  stockStatus?: StockStatus;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  leadTime: number;
  rating: number;
  contactEmail: string;
}

export interface Order {
  id: string;
  partId: string;
  partNumber: string;
  quantity: number;
  supplier: string;
  status: OrderStatus;
  requestedDate: string;
  estimatedDelivery: string;
  totalCost: number;
  relatedInspectionId: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical' | 'routine' | 'urgent';
}
