import { axiosClient } from '../../../api/axiosClient';
import type { DashboardSummary } from '../types/dashboardTypes';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await axiosClient.get<DashboardSummary>('/api/dashboard/summary');
  return response.data;
};
