'use client';

import { Table, TablePagination, type Column } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getSeverityBgColor } from '@/lib/utils';

export interface EntityRisk {
  _id: string;
  entity_id: string;
  entity_type: 'USER' | 'IP' | 'HOST';
  risk_score: number;
  risk_factors: Array<{
    factor: string;
    score: number;
    details: string;
  }>;
  last_updated: string;
}

interface EntityTableProps {
  entities: EntityRisk[];
  totalEntities: number;
  isLoading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEntitySelect: (entity: EntityRisk) => void;
  selectedEntityId?: string;
  onRecalculateClick?: () => void;
  isRecalculating?: boolean;
  entityTypeFilter?: string;
  onEntityTypeFilterChange?: (type: string) => void;
}

export default function EntityTable({
  entities = [],
  totalEntities = 0,
  isLoading = false,
  page = 1,
  pageSize = 10,
  onPageChange,
  onEntitySelect,
  selectedEntityId,
  onRecalculateClick,
  isRecalculating = false,
  entityTypeFilter = '',
  onEntityTypeFilterChange,
}: EntityTableProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getEntityTypeBadge = (type: EntityRisk['entity_type']) => {
    switch (type) {
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      case 'IP':
        return 'bg-purple-100 text-purple-800';
      case 'HOST':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<EntityRisk>[] = [
    {
      header: 'Entity ID',
      accessorKey: 'entity_id',
      className: 'min-w-[200px]',
    },
    {
      header: 'Type',
      accessorKey: 'entity_type',
      className: 'w-24',
      cell: (entity) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getEntityTypeBadge(
            entity.entity_type
          )}`}
        >
          {entity.entity_type}
        </span>
      ),
    },
    {
      header: 'Risk Score',
      accessorKey: 'risk_score',
      className: 'w-40',
      cell: (entity) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
            <div
              className={`h-2.5 rounded-full ${getSeverityBgColor(
                entity.risk_score
              )}`}
              style={{ width: `${entity.risk_score * 10}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {entity.risk_score.toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      header: 'Last Updated',
      accessorKey: 'last_updated',
      className: 'w-40',
      cell: (entity) => (
        <span className="text-sm text-gray-500">
          {formatDate(entity.last_updated)}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium">Entity Risk Scores</h3>

          {onEntityTypeFilterChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <div className="flex space-x-1">
                {['', 'USER', 'IP', 'HOST'].map((type) => (
                  <button
                    key={type || 'ALL'}
                    onClick={() => onEntityTypeFilterChange(type)}
                    className={`px-2 py-1 text-xs rounded-md ${
                      entityTypeFilter === type
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {type || 'All'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {onRecalculateClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRecalculateClick}
            disabled={isRecalculating}
          >
            {isRecalculating ? 'Recalculating...' : 'Recalculate Risk Scores'}
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        data={entities}
        isLoading={isLoading}
        noDataMessage="No entities found"
        rowClassName={(item) =>
          item._id === selectedEntityId ? 'bg-blue-50' : ''
        }
        onRowClick={onEntitySelect}
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
