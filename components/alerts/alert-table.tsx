'use client';

import { Table, TablePagination, type Column } from '@/components/ui/table';
import { Dropdown } from '@/components/ui/dropdown';
import { formatDate, getSeverityBgColor } from '@/lib/utils';

export interface Alert {
  _id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  source_log_id?: string;
  log_type?: string;
  entities?: Array<{
    type: string;
    value: string;
  }>;
  tactic?: string;
  technique?: string;
}

interface AlertTableProps {
  alerts: Alert[];
  totalAlerts: number;
  isLoading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onAlertSelect: (alert: Alert) => void;
  onStatusChange?: (alertId: string, status: Alert['status']) => void;
  selectedAlertId?: string;
}

export default function AlertTable({
  alerts = [],
  totalAlerts = 0,
  isLoading = false,
  page = 1,
  pageSize = 10,
  onPageChange,
  onAlertSelect,
  onStatusChange,
  selectedAlertId,
}: AlertTableProps) {
  const columns: Column<Alert>[] = [
    {
      header: 'Severity',
      accessorKey: 'severity',
      className: 'w-24',
      cell: (alert) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBgColor(
            alert.severity === 'CRITICAL'
              ? 10
              : alert.severity === 'HIGH'
              ? 8
              : alert.severity === 'MEDIUM'
              ? 5
              : 2
          )}`}
        >
          {alert.severity}
        </span>
      ),
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (alert) => (
        <div className="max-w-md">
          <div className="font-medium text-sm">{alert.title}</div>
          <div className="text-xs text-gray-500 truncate">
            {alert.description}
          </div>
        </div>
      ),
    },
    {
      header: 'Time',
      accessorKey: 'timestamp',
      className: 'w-40',
      cell: (alert) => (
        <span className="text-sm text-gray-500">
          {formatDate(alert.timestamp)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      className: 'w-32',
      cell: (alert) => {
        const statusColors: Record<Alert['status'], string> = {
          NEW: 'bg-blue-100 text-blue-800',
          IN_PROGRESS: 'bg-purple-100 text-purple-800',
          RESOLVED: 'bg-green-100 text-green-800',
          FALSE_POSITIVE: 'bg-gray-100 text-gray-800',
        };

        const statusLabels: Record<Alert['status'], string> = {
          NEW: 'New',
          IN_PROGRESS: 'In Progress',
          RESOLVED: 'Resolved',
          FALSE_POSITIVE: 'False Positive',
        };

        if (onStatusChange) {
          return (
            <Dropdown
              items={[
                { label: 'New', value: 'NEW' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Resolved', value: 'RESOLVED' },
                { label: 'False Positive', value: 'FALSE_POSITIVE' },
              ]}
              value={alert.status}
              onChange={(value) =>
                onStatusChange(alert._id, value as Alert['status'])
              }
              buttonClassName={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[alert.status]}`}
            />
          );
        }

        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[alert.status]}`}
          >
            {statusLabels[alert.status]}
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Security Alerts</h3>
      </div>

      <Table
        columns={columns}
        data={alerts}
        isLoading={isLoading}
        noDataMessage="No alerts found"
        rowClassName={(item) =>
          item._id === selectedAlertId ? 'bg-blue-50' : ''
        }
        onRowClick={onAlertSelect}
        keyExtractor={(item) => item._id}
      />

      <div className="border-t border-gray-200">
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalAlerts}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
