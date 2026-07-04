import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Star,
  StarOff,
  Trash2,
  Plus,
  DollarSign,
  MapPin,
  BedDouble,
  Filter,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCreateProperty, useUpdateProperty, useDeleteProperty } from '@/hooks/useProperties';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { CITIES, PROPERTY_TYPES } from '@/lib/constants';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import { PropertyFormModal } from '@/components/admin/PropertyFormModal';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { Property, PaginatedResponse } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CITY_OPTIONS = [{ value: '', label: 'All Cities' }, ...CITIES.map((c) => ({ value: c.name, label: c.name }))];
const TYPE_OPTIONS = [{ value: '', label: 'All Types' }, ...PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))];

export default function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Property>>({
    queryKey: ['admin', 'properties', search, cityFilter, typeFilter, minPrice, maxPrice, page, perPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (cityFilter) params.set('city', cityFilter);
      if (typeFilter) params.set('property_type', typeFilter);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      const { data } = await api.get(`/properties?${params.toString()}`);
      return data;
    },
  });

  const properties: Property[] = data?.items ?? [];
  const total: number = data?.total ?? properties.length;
  const totalPages = Math.ceil(total / perPage);

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const deleteMutation = useDeleteProperty();

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: number; is_featured: boolean }) => {
      const { data } = await api.put(`/properties/${id}`, { is_featured });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      toast.success('Property updated');
    },
    onError: () => toast.error('Failed to update property'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { data } = await api.put(`/properties/${id}`, { is_active });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      toast.success('Property status updated');
    },
    onError: () => toast.error('Failed to update property'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.delete(`/properties/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      toast.success('Properties deleted');
    },
    onError: () => toast.error('Failed to delete some properties'),
  });

  const stats = useMemo(() => ({
    total,
    active: properties.filter((p) => p.is_active).length,
    featured: properties.filter((p) => p.is_featured).length,
    avgPrice: properties.length > 0 ? Math.round(properties.reduce((s, p) => s + p.price, 0) / properties.length) : 0,
  }), [properties, total]);

  const handleExport = useCallback(() => {
    const csv = [
      ['Title', 'Type', 'Price', 'City', 'Beds', 'Status', 'Featured', 'Created'].join(','),
      ...properties.map((p) =>
        [
          `"${p.title}"`,
          p.property_type,
          p.price,
          p.city,
          p.bedrooms,
          p.is_active ? 'Active' : 'Inactive',
          p.is_featured ? 'Yes' : 'No',
          p.created_at,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `properties-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Properties exported');
  }, [properties]);

  const handleBulkDelete = useCallback(
    (ids: string[]) => {
      if (window.confirm(`Delete ${ids.length} property(ies)?`)) {
        bulkDeleteMutation.mutate(ids);
      }
    },
    [bulkDeleteMutation]
  );

  const columns: ColumnDef<Property>[] = [
    {
      key: 'title',
      header: 'Property',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
            {p.images && p.images.length > 0 ? (
              <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-5 w-5 text-white/30" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate max-w-[200px]">{p.title}</p>
            <p className="text-xs text-white/40">{p.city}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'property_type',
      header: 'Type',
      sortable: true,
      render: (p) => (
        <span className="text-sm text-white/60 capitalize">{p.property_type}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (p) => (
        <span className="font-medium text-white text-sm">{formatCurrency(p.price)}</span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      sortable: true,
      render: (p) => (
        <span className="flex items-center gap-1 text-sm text-white/50">
          <MapPin className="w-3 h-3" />
          {p.city}
        </span>
      ),
    },
    {
      key: 'bedrooms',
      header: 'Beds',
      sortable: true,
      render: (p) => (
        <span className="flex items-center gap-1 text-sm text-white/50">
          <BedDouble className="w-3 h-3" />
          {p.bedrooms}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (p) =>
        p.is_active ? (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-red-400">
            <XCircle className="h-3.5 w-3.5" /> Inactive
          </span>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (p) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewingProperty(p);
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingProperty(p);
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFeaturedMutation.mutate({ id: p.id, is_featured: !p.is_featured });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              p.is_featured ? 'text-amber-400 hover:bg-amber-500/10' : 'text-white/40 hover:text-amber-400 hover:bg-amber-500/10'
            )}
            title={p.is_featured ? 'Unfeature' : 'Feature'}
          >
            {p.is_featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingProperty(p);
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Property Management</h1>
              <p className="mt-1 text-surface-400">{total} total properties</p>
            </div>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Property
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <AdminStatsCard
              icon={<Building2 className="h-5 w-5 text-blue-400" />}
              value={stats.total}
              label="Total Properties"
              change={5}
              gradient="from-blue-500/20 to-blue-600/5"
            />
            <AdminStatsCard
              icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
              value={stats.active}
              label="Active Listings"
              change={8}
              gradient="from-emerald-500/20 to-emerald-600/5"
            />
            <AdminStatsCard
              icon={<Star className="h-5 w-5 text-amber-400" />}
              value={stats.featured}
              label="Featured"
              gradient="from-amber-500/20 to-orange-500/5"
            />
            <AdminStatsCard
              icon={<DollarSign className="h-5 w-5 text-purple-400" />}
              value={stats.avgPrice}
              label="Avg Price (INR)"
              gradient="from-purple-500/20 to-purple-600/5"
            />
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by title or city..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={cityFilter}
                onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 backdrop-blur-sm outline-none focus:border-blue-500/50"
              >
                {CITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 backdrop-blur-sm outline-none focus:border-blue-500/50"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm outline-none focus:border-blue-500/50"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm outline-none focus:border-blue-500/50"
              />
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div variants={itemVariants}>
            <DataTable
              columns={columns}
              data={properties}
              idAccessor={(p) => String(p.id)}
              isLoading={isLoading}
              selectable
              emptyTitle="No properties found"
              emptyDescription="No properties match your filters."
              emptyIcon={<Building2 className="w-10 h-10 text-white/20" />}
              bulkActions={[
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-3 h-3" />,
                  onClick: handleBulkDelete,
                  variant: 'danger',
                },
              ]}
              onExport={handleExport}
              exportLabel="Export CSV"
              pagination={{
                currentPage: page,
                totalPages,
                totalItems: total,
                perPage,
                onPageChange: setPage,
                onPerPageChange: (n) => {
                  setPerPage(n);
                  setPage(1);
                },
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Add / Edit Modal */}
      <PropertyFormModal
        isOpen={showAddModal || !!editingProperty}
        onClose={() => {
          setShowAddModal(false);
          setEditingProperty(null);
        }}
        property={editingProperty}
        onSave={(data) => {
          if (editingProperty) {
            updateMutation.mutate(
              { id: editingProperty.id, data },
              {
                onSuccess: () => {
                  setEditingProperty(null);
                },
              }
            );
          } else {
            createMutation.mutate(data as any, {
              onSuccess: () => {
                setShowAddModal(false);
              },
            });
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* View Modal */}
      <Modal
        isOpen={!!viewingProperty}
        onClose={() => setViewingProperty(null)}
        title="Property Details"
        size="lg"
      >
        {viewingProperty && (
          <div className="space-y-4">
            {viewingProperty.images && viewingProperty.images.length > 0 && (
              <div className="rounded-xl overflow-hidden h-48">
                <img
                  src={viewingProperty.images[0]}
                  alt={viewingProperty.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Title</p>
                <p className="text-sm text-white font-medium">{viewingProperty.title}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Type</p>
                <p className="text-sm text-white capitalize">{viewingProperty.property_type}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Price</p>
                <p className="text-sm text-white font-medium">{formatCurrency(viewingProperty.price)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">City</p>
                <p className="text-sm text-white">{viewingProperty.city}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Bedrooms</p>
                <p className="text-sm text-white">{viewingProperty.bedrooms} BHK</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Bathrooms</p>
                <p className="text-sm text-white">{viewingProperty.bathrooms}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Area</p>
                <p className="text-sm text-white">{viewingProperty.area} sq ft</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Status</p>
                <p className={cn('text-sm font-medium', viewingProperty.is_active ? 'text-emerald-400' : 'text-red-400')}>
                  {viewingProperty.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            {viewingProperty.description && (
              <div>
                <p className="text-xs text-white/40 mb-1">Description</p>
                <p className="text-sm text-white/60">{viewingProperty.description}</p>
              </div>
            )}
            {viewingProperty.amenities && viewingProperty.amenities.length > 0 && (
              <div>
                <p className="text-xs text-white/40 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {viewingProperty.amenities.map((a, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white/50">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deletingProperty}
        onClose={() => setDeletingProperty(null)}
        title="Delete Property"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Are you sure you want to delete <strong className="text-white">{deletingProperty?.title}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeletingProperty(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (deletingProperty) {
                  deleteMutation.mutate(deletingProperty.id, {
                    onSuccess: () => setDeletingProperty(null),
                  });
                }
              }}
            >
              Delete Property
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
