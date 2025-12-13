'use client';

import { Table, TablePagination, type Column } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

export interface EntityRisk {
  _id: string;
  entity: string;
  type: string;
  risk_score: number;
  occurrences: number;
  first_seen: string;
  last_seen: string;
}

interface EntityTableProps {
  entities: EntityRisk[];
  totalEntities: number;
  isLoading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function EntityTable({
  entities = [],
  totalEntities = 0,
  isLoading = false,
  page = 1,
  pageSize = 10,
  onPageChange,
}: EntityTableProps) {
  const columns: Column<EntityRisk>[] = [
    {
      header: 'Entity',
      accessorKey: 'entity',
      className: 'font-medium',
    },
    {
      header: 'Type',
      accessorKey: 'type',
      className: 'w-32',
    },
    {
      header: 'Risk Score',
      accessorKey: 'risk_score',
      className: 'w-32',
      cell: (entity) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            entity.risk_score >= 8
              ? 'bg-red-100 text-red-800'
              : entity.risk_score >= 5
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {entity.risk_score}
        </span>
      ),
    },
    {
      header: 'Occurrences',
      accessorKey: 'occurrences',
      className: 'w-32 text-center',
    },
    {
      header: 'First Seen',
      accessorKey: 'first_seen',
      className: 'w-40',
      cell: (entity) => formatDate(entity.first_seen),
    },
    {
      header: 'Last Seen',
      accessorKey: 'last_seen',
      className: 'w-40',
      cell: (entity) => formatDate(entity.last_seen),
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Risky Entities</h3>
      </div>

      <Table
        columns={columns}
        data={entities}
        isLoading={isLoading}
        noDataMessage="No entities found"
        keyExtractor={(item) => item._id}
      />

      <div className="border-t border-gray-200">
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalEntities}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
