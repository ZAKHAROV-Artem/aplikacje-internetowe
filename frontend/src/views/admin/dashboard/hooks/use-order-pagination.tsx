import { useState } from "react";

export interface PaginationState {
  page: number;
  limit: number;
}

export function useOrderPagination(limit: number = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit,
  });

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const nextPage = () => {
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const previousPage = () => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  };

  const resetPagination = () => {
    setPagination({ page: 1, limit });
  };

  return {
    pagination,
    goToPage,
    nextPage,
    previousPage,
    resetPagination,
  };
}
