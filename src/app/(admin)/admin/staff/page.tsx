'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { UserCircle, KeyRound } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { Input } from '@/components/admin/ui/Input';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { Select } from '@/components/admin/ui/Select';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { useConfirm } from '@/components/admin/ui/ConfirmDialog';
import { ROLE_LABELS, type StaffRole } from '@/lib/permissions';

const roleOptions = (Object.keys(ROLE_LABELS) as StaffRole[]).map((r) => ({ value: r, label: ROLE_LABELS[r] }));

export default function AdminStaffPage() {
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const staff = useQuery(api.staff.listStaff);
  const addStaffMember = useMutation(api.staff.addStaffMember);
  const updateStaffRole = useMutation(api.staff.updateStaffRole);
  const deactivateStaff = useMutation(api.staff.deactivateStaff);
  const resetStaffPin = useMutation(api.staff.resetStaffPin);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('pharmacist');
  const [pin, setPin] = useState('');
  const [adding, setAdding] = useState(false);

  const [pinResetFor, setPinResetFor] = useState<{ id: Id<'staff'>; name: string } | null>(null);
  const [newPin, setNewPin] = useState('');
  const [resettingPin, setResettingPin] = useState(false);

  const handleAdd = async () => {
    if (!name || !email) return;
    if (!/^\d{4}$/.test(pin)) {
      toast('PIN must be exactly 4 digits');
      return;
    }
    setAdding(true);
    try {
      await addStaffMember({ name, email, phone: phone || undefined, role, pin });
      toast('Staff member added');
      setModalOpen(false);
      setName(''); setEmail(''); setPhone(''); setRole('pharmacist'); setPin('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add staff member');
    } finally {
      setAdding(false);
    }
  };

  const handleResetPin = async () => {
    if (!pinResetFor) return;
    if (!/^\d{4}$/.test(newPin)) {
      toast('PIN must be exactly 4 digits');
      return;
    }
    setResettingPin(true);
    try {
      await resetStaffPin({ id: pinResetFor.id, pin: newPin });
      toast(`PIN reset for ${pinResetFor.name}`);
      setPinResetFor(null);
      setNewPin('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to reset PIN');
    } finally {
      setResettingPin(false);
    }
  };

  return (
    <div className="pb-16">
      <PageHeader title="Users and permissions" backUrl="/admin/settings" primaryAction={{ label: 'Add staff', onClick: () => setModalOpen(true) }} />

      <Card title="Staff">
        {staff === undefined ? (
          <SkeletonLoader type="text" count={4} />
        ) : staff.length === 0 ? (
          <EmptyState icon={UserCircle} heading="No staff members yet" body="Add your team so they can help manage the store." action={{ label: 'Add staff', onClick: () => setModalOpen(true) }} />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[560px]">
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
                      <Select
                        className="w-40"
                        value={s.role}
                        onChange={async (v) => {
                          const ok = await confirm({
                            title: 'Change role',
                            message: `Change ${s.name}'s role to ${ROLE_LABELS[v as StaffRole]}? This changes what they can access immediately.`,
                            confirmLabel: 'Change role',
                          });
                          if (ok) await updateStaffRole({ id: s._id, role: v as StaffRole });
                        }}
                        options={roleOptions}
                      />
                    </td>
                    <td className="px-4">
                      <Badge status={s.active ? 'success' : 'default'}>{s.active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 text-right whitespace-nowrap">
                      {s.active && (
                        <>
                          <button
                            onClick={() => { setPinResetFor({ id: s._id, name: s.name }); setNewPin(''); }}
                            className="inline-flex items-center gap-1 text-p-text-subdued text-sm hover:text-p-text hover:underline mr-4"
                          >
                            <KeyRound size={13} /> Reset PIN
                          </button>
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
                        </>
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
        primaryAction={{ label: 'Add staff', onClick: handleAdd, loading: adding }}
        secondaryAction={{ label: 'Cancel', onClick: () => setModalOpen(false) }}
      >
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Select label="Role" value={role} onChange={(v) => setRole(v as StaffRole)} options={roleOptions} />
          <Input
            label="4-digit PIN"
            helpText="Staff use this PIN to log into the admin panel."
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </div>
      </Modal>

      <Modal
        open={pinResetFor !== null}
        onClose={() => setPinResetFor(null)}
        title={`Reset PIN${pinResetFor ? ` for ${pinResetFor.name}` : ''}`}
        primaryAction={{ label: 'Reset PIN', onClick: handleResetPin, loading: resettingPin }}
        secondaryAction={{ label: 'Cancel', onClick: () => setPinResetFor(null) }}
      >
        <Input
          label="New 4-digit PIN"
          inputMode="numeric"
          maxLength={4}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        />
      </Modal>
    </div>
  );
}
