"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AppPaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
  className?: string;
  itemName?: string;
  showText?: boolean;
  currentCount?: number;
}

export function AppPagination({
  page = 1,
  total = 0,
  limit = 10,
  onChange,
  className,
  itemName = "mục",
  showText = true,
  currentCount,
}: AppPaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (total <= 0) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onChange(newPage);
    }
  };

  return (
    <div className={className}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={
                page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
              onClick={() => handlePageChange(page - 1)}
            />
          </PaginationItem>

          {(() => {
            const maxVisible = 5;
            let startPage = Math.max(1, page - 2);
            const endPage = Math.min(totalPages, startPage + maxVisible - 1);

            if (endPage - startPage + 1 < maxVisible) {
              startPage = Math.max(1, endPage - maxVisible + 1);
            }

            const length = Math.min(maxVisible, endPage - startPage + 1);

            return Array.from({ length }, (_, i) => startPage + i).map(
              (pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={page === pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ),
            );
          })()}

          <PaginationItem>
            <PaginationNext
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              onClick={() => handlePageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {showText && currentCount !== undefined && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          Hiển thị {currentCount} / {total} {itemName}
        </div>
      )}
    </div>
  );
}
