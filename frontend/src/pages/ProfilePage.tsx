import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
  Shield,
  Calendar,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, getInitials, cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const response = await api.put('/auth/profile', data);
      setUser(response.data);
      setIsEditing(false);
      reset(data);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset({
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    });
    setIsEditing(false);
  };

  const roleColor = cn(
    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
    user?.role === 'admin' && 'bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/20',
    user?.role === 'analyst' && 'bg-secondary-500/10 text-secondary-400 ring-1 ring-secondary-500/20',
    user?.role === 'user' && 'bg-surface-500/10 text-surface-400 ring-1 ring-surface-500/20'
  );

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="mt-1 text-surface-400">Manage your account settings and preferences</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-surface-800/50 bg-surface-900/60 shadow-glass backdrop-blur-xl">
            <div className="relative h-32 bg-gradient-to-r from-primary-600 to-secondary-600">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-surface-900 bg-gradient-to-br from-primary-500 to-primary-600 text-4xl font-bold text-white shadow-xl">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="h-full w-full rounded-3xl object-cover"
                      />
                    ) : (
                      getInitials(user?.full_name ?? 'U')
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-surface-800 text-surface-400 shadow-lg transition-colors hover:bg-surface-700 hover:text-white">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-8 pt-20 pb-8">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{user?.full_name ?? 'User'}</h2>
                  <p className="text-surface-400">{user?.email}</p>
                </div>
                <span className={roleColor}>
                  <Shield className="h-3 w-3" />
                  {ROLE_LABELS[user?.role ?? 'user']}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-surface-800/50 pt-6 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-surface-800/30 p-3">
                  <Calendar className="h-5 w-5 text-surface-500" />
                  <div>
                    <p className="text-xs text-surface-500">Member Since</p>
                    <p className="text-sm font-medium text-white">
                      {user?.created_at ? formatDate(user.created_at) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-surface-800/30 p-3">
                  <Building2 className="h-5 w-5 text-surface-500" />
                  <div>
                    <p className="text-xs text-surface-500">Role</p>
                    <p className="text-sm font-medium text-white">
                      {ROLE_LABELS[user?.role ?? 'user']}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-surface-800/30 p-3">
                  <Shield className="h-5 w-5 text-surface-500" />
                  <div>
                    <p className="text-xs text-surface-500">Status</p>
                    <p className="text-sm font-medium text-secondary-400">Active</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-surface-800/50 pt-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-xl bg-surface-800/50 px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-700/50 hover:text-white"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="rounded-xl bg-surface-800/50 px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-700/50 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving || !isDirty}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-surface-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500" />
                        <input
                          {...register('full_name')}
                          disabled={!isEditing}
                          className={cn(
                            'w-full rounded-xl border bg-surface-800/50 py-3 pl-11 pr-4 text-white placeholder-surface-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                            isEditing
                              ? 'border-primary-500/50 focus:border-primary-500'
                              : 'border-surface-700/50 cursor-not-allowed opacity-70'
                          )}
                        />
                      </div>
                      {errors.full_name && (
                        <p className="text-sm text-red-400">{errors.full_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-surface-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500" />
                        <input
                          {...register('email')}
                          disabled={!isEditing}
                          type="email"
                          className={cn(
                            'w-full rounded-xl border bg-surface-800/50 py-3 pl-11 pr-4 text-white placeholder-surface-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                            isEditing
                              ? 'border-primary-500/50 focus:border-primary-500'
                              : 'border-surface-700/50 cursor-not-allowed opacity-70'
                          )}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-surface-300">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500" />
                        <input
                          {...register('phone')}
                          disabled={!isEditing}
                          type="tel"
                          placeholder="Not set"
                          className={cn(
                            'w-full rounded-xl border bg-surface-800/50 py-3 pl-11 pr-4 text-white placeholder-surface-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                            isEditing
                              ? 'border-primary-500/50 focus:border-primary-500'
                              : 'border-surface-700/50 cursor-not-allowed opacity-70'
                          )}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-400">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-surface-300">
                        Account Status
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-surface-700/50 bg-surface-800/50 px-4 py-3">
                        <div className="h-2 w-2 rounded-full bg-secondary-400" />
                        <span className="text-sm text-white">
                          {user?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
