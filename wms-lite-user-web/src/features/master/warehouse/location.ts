export interface LocationResponse {
  id: number;
  code: string;
  name: string;
  xAxis?: number | null;
  yAxis?: number | null;
  zAxis?: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationSummaryResponse {
  id: number;
  code: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LocationCreateRequest {
  warehouseId: number;
  code: string;
  name: string;
  xAxis?: number;
  yAxis?: number;
  zAxis?: number;
  description?: string;
}

export interface LocationUpdateRequest {
  name: string;
  xAxis?: number;
  yAxis?: number;
  zAxis?: number;
  description?: string;
}
