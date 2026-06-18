export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled' | 'requested';

export interface Part {
  id: string;
  partNumber: string;
  description: string;
  manufacturer: string;
  compatibleAircraft: string[];
  quantity: number;
  minThreshold: number;
  unitCost: number;
  category: string;
  stockStatus: StockStatus;
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
