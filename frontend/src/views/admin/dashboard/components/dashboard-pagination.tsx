import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface DashboardPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function DashboardPagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
}: DashboardPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm text-muted-foreground whitespace-nowrap">
        Page {currentPage} of {totalPages}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPrevious();
              }}
              aria-disabled={currentPage === 1}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {/* First page */}
          {currentPage > 3 && (
            <>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}

          {/* Previous page */}
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(currentPage - 1);
                }}
              >
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Current page */}
          <PaginationItem>
            <PaginationLink href="#" isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>

          {/* Next page */}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(currentPage + 1);
                }}
              >
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Last page */}
          {currentPage < totalPages - 2 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(totalPages);
                  }}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNext();
              }}
              aria-disabled={currentPage === totalPages}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
