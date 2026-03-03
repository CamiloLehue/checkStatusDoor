export interface HistorySensorType {
  pagination: Pagination;
  events: Events[];
}

export interface Events {
  _id: string;
  nombre: string;
  id_device: number;
  centro_lugar: string;
  status: number;
  estado: string;
  timestamp: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}