export interface RecentTransaction {
  id: number;
  time: string;
  type: 'INBOUND' | 'OUTBOUND' | 'MOVEMENT' | 'ADJUSTMENT';
  typeLabel: string;
  itemCode: string;
  itemName: string;
  locationCode: string;
  quantity: number;
  status: string;
}

export interface DashboardSummary {
  totalInventoryQuantity: number;
  totalItemSkuCount: number;
  todayInboundCount: number;
  todayInboundQuantity: number;
  todayOutboundCount: number;
  todayOutboundQuantity: number;
  pendingInboundCount: number;
  pendingOutboundCount: number;
  recentTransactions: RecentTransaction[];
}
