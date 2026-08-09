'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { UserCircle } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { Input } from '@/components/admin/ui/Input';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { useConfirm } from '@/components/admin/ui/ConfirmDialog';

type Role = 'super_admin' | 'admin' | 'pharmacist' | 'support';

const roleLabels: Record<Role, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  pharmacist: 'Pharmacist',
  support: 'Support',
};

export default function AdminStaffPage() {
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const staff = useQuery(api.staff.listStaff);
  const addStaffMember = useMutation(api.staff.addStaffMember);
  const updateStaffRole = useMutation(api.staff.updateStaffRole);
  const deactivateStaff = useMutation(api.staff.deactivateStaff);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('support');

  const handleAdd = async () => {
    if (!name || !email) return;
    await addStaffMember({ name, email, phone: phone || undefined, role });
    toast('Staff member added');
    setModalOpen(false);
    setName(''); setEmail(''); setPhone(''); setRole('support');
  };

  return (
    <div className="pb-16">
      <PageHeader title="Users and permissions" primaryAction={{ label: 'Add staff', onClick: () => setModalOpen(true) }} />

      <Card title="Staff">
        {staff === undefined ? (
          <SkeletonLoader type="text" count={4} />
        ) : staff.length === 0 ? (
          <EmptyState icon={UserCircle} heading="No staff members yet" body="Add your team so they can help manage the store." action={{ label: 'Add staff', onClick: () => setModalOpen(true) }} />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-p-bg h-11 text-[13px] font-semibold text-p-text-subdued uppercase tracking-wide">
                  <th className="text-left px-4">Name</th>
                  <th className="text-left px-4">Email</th>
                  <th className="text-left px-4">Role</th>
                  <th className="text-left px-4">Status</th>
                  <th className="px-4" />
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s._id} className="h-[52px] border-b border-p-border-subdued text-sm">
                    <td className="px-4 font-medium text-p-text">{s.name}</td>
                    <td className="px-4 text-p-text-subdued">{s.email}</td>
                    <td className="px-4">
                      <select
                        value={s.role}
                        onChange={(e) => updateStaffRole({ id: s._id, role: e.target.value as Role })}
                        className="h-8 rounded px-2 text-sm border border-p-border-input bg-p-bg-surface"
                      >
                        {(Object.keys(roleLabels) as Role[]).map((r) => (
                          <option key={r} value={r}>{roleLabels[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4">
                      <Badge status={s.active ? 'success' : 'default'}>{s.active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 text-right">
                      {s.active && (
                        <button
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Deactivate staff member',
                              message: `${s.name} will lose access immediately. You can't undo this from here.`,
                              confirmLabel: 'Deactivate',
                              destructive: true,
                            });
                            if (ok) {
                              await deactivateStaff({ id: s._id as Id<'staff'> });
                              toast(`${s.name} deactivated`);
                            }
                          }}
                          className="text-p-critical text-sm hover:underline"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add staff member"
        primaryAction={{ label: 'Add staff', onClick: handleAdd }}
        secondaryAction={{ label: 'Cancel', onClick: () => setModalOpen(false) }}
      >
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-p-text mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-9 w-full rounded px-3 text-sm border border-p-border-input bg-p-bg-surface"
            >
              {(Object.keys(roleLabels) as Role[]).map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
