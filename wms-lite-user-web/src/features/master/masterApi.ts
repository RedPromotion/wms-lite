import { axiosClient } from '../../api/axiosClient';
import type {
  WarehouseResponse,
  LocationResponse,
  ItemCategoryResponse,
  ItemResponse,
  CustomerResponse,
  SupplierResponse,
} from './master';

// --- Warehouse / Location API ---
export const getWarehousesApi = async (): Promise<WarehouseResponse[]> => {
  const response = await axiosClient.get<any>('/api/warehouses', { params: { size: 200 } });
  if (Array.isArray(response.data)) return response.data;
  if (response.data?.content && Array.isArray(response.data.content)) return response.data.content;
  return [];
};

export const getLocationsApi = async (warehouseId?: number): Promise<LocationResponse[]> => {
  try {
    if (warehouseId) {
      const response = await axiosClient.get<any>(`/api/warehouses/${warehouseId}/locations`, { params: { size: 500 } });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data?.content && Array.isArray(data.content)) return data.content;
      return [];
    }

    const warehouses = await getWarehousesApi();
    if (!warehouses || warehouses.length === 0) return [];

    const locationPromises = warehouses.map(async (wh) => {
      try {
        const res = await axiosClient.get<any>(`/api/warehouses/${wh.id}/locations`, { params: { size: 500 } });
        const data = res.data;
        const locList = Array.isArray(data) ? data : (data?.content || []);
        return locList.map((loc: any) => ({
          ...loc,
          warehouseName: loc.warehouseName || (wh as any).name || wh.warehouseName,
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(locationPromises);
    return results.flat();
  } catch {
    return [];
  }
};

// --- Item / Category API ---
export const getItemCategoriesApi = async (): Promise<ItemCategoryResponse[]> => {
  const response = await axiosClient.get<ItemCategoryResponse[]>('/api/item-categories');
  return response.data;
};

export const getItemsApi = async (params?: { categoryId?: number; keyword?: string }): Promise<ItemResponse[]> => {
  const response = await axiosClient.get<ItemResponse[]>('/api/items', { params });
  return response.data;
};

// --- Customer / Supplier API ---
export const getCustomersApi = async (keyword?: string): Promise<CustomerResponse[]> => {
  const response = await axiosClient.get<any>('/api/customers', {
    params: { keyword, size: 500 },
  });
  if (Array.isArray(response.data)) return response.data;
  if (response.data?.content && Array.isArray(response.data.content)) return response.data.content;
  return [];
};

export const getSuppliersApi = async (keyword?: string): Promise<SupplierResponse[]> => {
  const response = await axiosClient.get<any>('/api/suppliers', {
    params: { keyword, size: 500 },
  });
  if (Array.isArray(response.data)) return response.data;
  if (response.data?.content && Array.isArray(response.data.content)) return response.data.content;
  return [];
};

export const getDeliveryAddressesApi = async (customerId: number): Promise<any[]> => {
  try {
    const response = await axiosClient.get<any>(`/api/customers/${customerId}/addresses`, {
      params: { size: 100 },
    });
    if (Array.isArray(response.data)) return response.data;
    if (response.data?.content && Array.isArray(response.data.content)) return response.data.content;
    return [];
  } catch {
    return [];
  }
};
