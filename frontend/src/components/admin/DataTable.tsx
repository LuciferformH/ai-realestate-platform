import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Download,
  Trash2,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
  variant?: 'default' | 'danger';
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  idAccessor: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  bulkActions?: BulkAction[];
  selectable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (count: number) => void;
  };
  onExport?: () => void;
  exportLabel?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  idAccessor,
  isLoading = false,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display.',
  emptyIcon,
  bulkActions = [],
  selectable = false,
  pagination,
  onExport,
  exportLabel = 'Export',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDir]);

  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(idAccessor(row)));

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((row) => idAccessor(row))));
    }
  }, [allSelected, data, idAccessor]);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="p-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectable && selectedArray.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 bg-blue-500/10"
          >
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-blue-300 font-medium">
                {selectedArray.length} row{selectedArray.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                {bulkActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => action.onClick(selectedArray)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${action.variant === 'danger'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }
                    `}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-white/40 hover:text-white/60 ml-2"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <button
                    onClick={toggleSelectAll}
                    className={`
                      w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                      ${allSelected
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-white/20 hover:border-white/40'
                      }
                    `}
                  >
                    {allSelected && <Check className="w-3 h-3" />}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`
                    px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider
                    ${col.sortable ? 'cursor-pointer hover:text-white/70 select-none' : ''}
                    ${col.headerClassName || ''}
                  `}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <SortIcon colKey={col.key} currentSort={sortKey} direction={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-16"
                >
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => {
                const rowId = idAccessor(row);
                const isSelected = selectedIds.has(rowId);

                return (
                  <motion.tr
                    key={rowId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIdx * 0.02 }}
                    className={`
                      border-b border-white/5 last:border-0
                      ${rowIdx % 2 === 1 ? 'bg-white/[0.02]' : ''}
                      ${isSelected ? 'bg-blue-500/5' : ''}
                      hover:bg-white/[0.05] transition-colors
                    `}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3">
                        <button
                          onClick={() => toggleRow(rowId)}
                          className={`
                            w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                            ${isSelected
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-white/20 hover:border-white/40'
                            }
                          `}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 text-white/80 ${col.className || ''}`}>
                        {col.render ? col.render(row, rowIdx) : row[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {(pagination || onExport) && (
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            {pagination && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
                itemsPerPage={pagination.perPage}
                totalItems={pagination.totalItems}
                onItemsPerPageChange={pagination.onPerPageChange}
              />
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {exportLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SortIcon({
  colKey,
  currentSort,
  direction,
}: {
  colKey: string;
  currentSort: string | null;
  direction: 'asc' | 'desc';
}) {
  if (currentSort !== colKey) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return direction === 'asc' ? (
    <ArrowUp className="w-3 h-3 text-blue-400" />
  ) : (
    <ArrowDown className="w-3 h-3 text-blue-400" />
  );
}

export default DataTable;
