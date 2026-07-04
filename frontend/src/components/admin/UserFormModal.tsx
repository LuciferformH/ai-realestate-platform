import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (data: { role: string; is_active: boolean }) => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Administrator' },
  { value: 'analyst', label: 'Data Analyst' },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading = false,
}) => {
  const [role, setRole] = useState<string>('user');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.is_active);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ role, is_active: isActive });
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-sm font-bold text-blue-400 overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              user.full_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
            )}
          </div>
          <div>
            <p className="font-medium text-white">{user.full_name}</p>
            <p className="text-sm text-white/40">{user.email}</p>
          </div>
        </div>

        <Select
          label="Role"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(val) => setRole(val as string)}
          placeholder="Select role"
        />

        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
          <div>
            <p className="text-sm font-medium text-white">Active Status</p>
            <p className="text-xs text-white/40">
              {isActive ? 'User can access the platform' : 'User is blocked from the platform'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${isActive ? 'bg-emerald-500' : 'bg-white/10'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 rounded-full bg-white transition-transform
                ${isActive ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
