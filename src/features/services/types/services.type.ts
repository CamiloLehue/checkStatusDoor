export interface ServicesType {
  id: number;
  center_id: number;
  name: string;
  type: string;
  ip_address: string;
  location_description: string;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  center: Center;
}

export interface Center {
  id: number;
  company_id: number;
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
