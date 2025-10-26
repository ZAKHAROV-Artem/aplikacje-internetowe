export type Order = {
  id: string;
  status: string;
  pickupDate?: string;
  dropoffDate?: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  route?: {
    name?: string;
  };
  company?: {
    name?: string;
  };
};

export interface FilterState {
  user: string;
  status: string;
  pickupDateRange: { from: Date | undefined; to: Date | undefined } | undefined;
  dropoffDateRange:
    | { from: Date | undefined; to: Date | undefined }
    | undefined;
  search: string;
}

export type GroupedOrders = { [key: string]: Order[] };

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  meta?: PaginationMeta;
}
