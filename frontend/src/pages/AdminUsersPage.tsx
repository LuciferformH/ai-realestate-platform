import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Download,
  Filter,
  UserCheck,
  UserX,
  BarChart3,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, getInitials, cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { User } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type RoleFilter = 'all' | 'user' | 'admin' | 'analyst';
type StatusFilter = 'all' | 'active' | 'inactive';

const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'analyst', label: 'Analyst' },
];

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter, statusFilter, page, perPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('is_active', statusFilter === 'active' ? 'true' : 'false');
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      const { data } = await api.get(`/admin/users?${params.toString()}`);
      return data;
    },
  });

  const users: User[] = data?.items ?? data ?? [];
  const total: number = data?.total ?? users.length;
  const totalPages = Math.ceil(total / perPage);

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role, is_active }: { id: number; role: string; is_active: boolean }) => {
      const { data } = await api.put(`/admin/users/${id}`, { role, is_active });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User updated successfully');
      setEditingUser(null);
    },
    onError: () => {
      toast.error('Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted successfully');
      setDeletingUser(null);
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.delete(`/admin/users/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Users deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete some users');
    },
  });

  const stats = useMemo(() => {
    const allUsers = data?.items ?? [];
    return {
      total,
      active: allUsers.filter((u: User) => u.is_active).length,
      admins: allUsers.filter((u: User) => u.role === 'admin').length,
      analysts: allUsers.filter((u: User) => u.role === 'analyst').length,
    };
  }, [data, total]);

  const handleExport = useCallback(() => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Created'].join(','),
      ...users.map((u) =>
        [u.full_name, u.email, u.role, u.is_active ? 'Active' : 'Inactive', u.created_at].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  }, [users]);

  const handleBulkDelete = useCallback(
    (ids: string[]) => {
      if (window.confirm(`Delete ${ids.length} user(s)?`)) {
        bulkDeleteMutation.mutate(ids);
      }
    },
    [bulkDeleteMutation]
  );

  const columns: ColumnDef<User>[] = [
    {
      key: 'full_name',
      header: 'User',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-bold text-blue-400 overflow-hidden flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
          <span className="font-medium text-white truncate">{user.full_name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      className: 'text-white/50',
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
            user.role === 'admin' && 'bg-blue-500/20 text-blue-400',
            user.role === 'analyst' && 'bg-purple-500/20 text-purple-400',
            user.role === 'user' && 'bg-white/10 text-white/50'
          )}
        >
          <Shield className="h-3 w-3" />
          {ROLE_LABELS[user.role]}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (user) =>
        user.is_active ? (
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
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (user) => (
        <span className="text-white/40 text-sm">{formatDate(user.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (user) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingUser(user);
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingUser(user);
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
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="mt-1 text-surface-400">{total} registered users</p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <AdminStatsCard
              icon={<Users className="h-5 w-5 text-blue-400" />}
              value={stats.total}
              label="Total Users"
              change={12}
              gradient="from-blue-500/20 to-blue-600/5"
            />
            <AdminStatsCard
              icon={<UserCheck className="h-5 w-5 text-emerald-400" />}
              value={stats.active}
              label="Active Users"
              change={8}
              gradient="from-emerald-500/20 to-emerald-600/5"
            />
            <AdminStatsCard
              icon={<Shield className="h-5 w-5 text-purple-400" />}
              value={stats.admins}
              label="Admins"
              gradient="from-purple-500/20 to-purple-600/5"
            />
            <AdminStatsCard
              icon={<BarChart3 className="h-5 w-5 text-amber-400" />}
              value={stats.analysts}
              label="Analysts"
              gradient="from-amber-500/20 to-orange-500/5"
            />
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as RoleFilter);
                  setPage(1);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 backdrop-blur-sm outline-none focus:border-blue-500/50"
              >
                {ROLE_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 backdrop-blur-sm outline-none focus:border-blue-500/50"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div variants={itemVariants}>
            <DataTable
              columns={columns}
              data={users}
              idAccessor={(u) => String(u.id)}
              isLoading={isLoading}
              selectable
              emptyTitle="No users found"
              emptyDescription="No users match your search criteria."
              emptyIcon={<Users className="w-10 h-10 text-white/20" />}
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

      {/* Edit Modal */}
      <UserFormModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={(data) => {
          if (editingUser) {
            updateRoleMutation.mutate({
              id: editingUser.id,
              role: data.role,
              is_active: data.is_active,
            });
          }
        }}
        isLoading={updateRoleMutation.isPending}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Are you sure you want to delete <strong className="text-white">{deletingUser?.full_name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteUserMutation.isPending}
              onClick={() => {
                if (deletingUser) {
                  deleteUserMutation.mutate(deletingUser.id);
                }
              }}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
