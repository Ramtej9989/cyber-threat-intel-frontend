import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  noDataMessage?: string;
  emptyRowCount?: number;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T) => string | number;
}

export const Table = <T,>({
  columns,
  data,
  isLoading = false,
  noDataMessage = 'No data available',
  emptyRowCount = 5,
  rowClassName,
  onRowClick,
  keyExtractor = (item: any) => item?._id ?? JSON.stringify(item),
}: TableProps<T>) => {
  const emptyRows = isLoading
    ? Array.from({ length: emptyRowCount })
    : [];

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            {columns.map((column, i) => (
              <th
                key={i}
                className={cn(
                  'h-10 px-4 text-left align-middle font-medium text-gray-500',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {isLoading ? (
            emptyRows.map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((item) => {
              const rowKey = keyExtractor(item);

              return (
                <tr
                  key={rowKey}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-gray-50',
                    rowClassName?.(item)
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-4 align-middle">
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                        ? (item[column.accessorKey] as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-gray-500"
              >
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const TablePagination = forwardRef<
  HTMLDivElement,
  PaginationProps
>(({ currentPage, pageSize, totalCount, onPageChange, className }, ref) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between px-4 py-3 border-t',
        className
      )}
    >
      <p className="text-sm text-gray-700">
        Showing{' '}
        <span className="font-medium">
          {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
        </span>{' '}
        to{' '}
        <span className="font-medium">
          {Math.min(currentPage * pageSize, totalCount)}
        </span>{' '}
        of <span className="font-medium">{totalCount}</span> results
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
});

TablePagination.displayName = 'TablePagination';

export { TablePagination as Pagination };
