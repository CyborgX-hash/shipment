export interface Shipment {
  _id: string;
  shipmentId: string;
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  currentLocation: { lat: number; lng: number };
  route: { lat: number; lng: number }[];
  status: string;
  riskLevel: string;
  eta: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Alert {
  _id?: string;
  shipmentId: string;
  message: string;
  severity: string;
  createdAt?: string;
}

export type PageName = 'Dashboard' | 'Shipments' | 'Live Map' | 'Alerts' | 'Analytics' | 'Settings';
