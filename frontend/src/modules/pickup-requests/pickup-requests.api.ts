import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/baseQuery";
import type {
  ApiResponse,
  CrmOrdersResponse,
  PickupRequest,
  PickupRequestCreateInput,
} from "magnoli-types";
import { dateToBusinessDate } from "magnoli-types";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Orders", "Subscriptions"],
  endpoints: (builder) => ({
    getOrders: builder.query<
      ApiResponse<{
        data: Array<{
          id: string;
          userId: string;
          routeId: string | null;
          companyId: string;
          locationId: string | null;
          status: string;
          pickupDate: Date | string;
          dropoffDate: Date | string;
          notes: string | null;
          createdAt: Date | string;
          updatedAt: Date | string;
          user?: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
          } | null;
          route?: {
            id: string;
            name: string;
          } | null;
          company?: {
            id: string;
            name: string;
          } | null;
          location?: {
            id: string;
            name: string;
            address: string;
            city: string;
            state: string;
            zip: string;
          } | null;
        }>;
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/pickups?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: (result) => [
        { type: "Orders", id: "LIST" },
        ...(result?.data?.data ?? []).map((record) => ({
          type: "Orders" as const,
          id: record.id,
        })),
      ],
    }),

    getOrderById: builder.query<ApiResponse<PickupRequest>, string>({
      query: (id) => ({
        url: `/pickups/${encodeURIComponent(id)}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),
    createPickupRequest: builder.mutation<
      ApiResponse<{
        id: string;
        userId: string;
        routeId: string | null;
        companyId: string;
        locationId: string | null;
        status: string;
        pickupDate: Date | string;
        dropoffDate: Date | string;
        notes: string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
        user?: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
        } | null;
        route?: {
          id: string;
          name: string;
        } | null;
        company?: {
          id: string;
          name: string;
        } | null;
        location?: {
          id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          zip: string;
        } | null;
      }>,
      PickupRequestCreateInput
    >({
      query: (body) => {
        // Ensure pickupDate is sent as BusinessDate (YYYY-MM-DD) per date rules
        const payload: typeof body = {
          ...body,
          pickupDate: dateToBusinessDate(body?.pickupDate),
          dropoffDate: dateToBusinessDate(body?.dropoffDate),
        };

        return {
          url: "/pickups",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        };
      },
      invalidatesTags: [
        { type: "Orders", id: "LIST" },
        { type: "Subscriptions", id: "LIST" },
      ],
    }),

    getSubscriptions: builder.query<CrmOrdersResponse, void>({
      query: () => ({
        url: "/pickups?recurring=true",
        method: "GET",
      }),
      providesTags: (result) => [
        { type: "Subscriptions", id: "LIST" },
        ...(result?.data?.records ?? []).map((record) => ({
          type: "Subscriptions" as const,
          id: record.id,
        })),
      ],
    }),

    cancelSubscription: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/pickups/${encodeURIComponent(id)}/cancel`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Subscriptions", id: "LIST" },
        { type: "Subscriptions", id },
        { type: "Orders", id: "LIST" },
        { type: "Orders", id },
      ],
    }),

    updateOrderStatus: builder.mutation<
      ApiResponse<unknown>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/pickups/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Orders", id: "LIST" },
        { type: "Orders", id },
      ],
    }),

    bulkUpdateOrderStatus: builder.mutation<
      ApiResponse<unknown>,
      { ids: string[]; status: string }
    >({
      query: ({ ids, status }) => ({
        url: "/pickups/bulk/status",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { ids, status },
      }),
      invalidatesTags: (_result, _error, { ids }) => [
        { type: "Orders", id: "LIST" },
        ...ids.map((id) => ({ type: "Orders" as const, id })),
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreatePickupRequestMutation,
  useGetSubscriptionsQuery,
  useCancelSubscriptionMutation,
  useUpdateOrderStatusMutation,
  useBulkUpdateOrderStatusMutation,
} = ordersApi;
