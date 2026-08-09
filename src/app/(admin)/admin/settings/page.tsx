'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useBranding } from '@/hooks/useBranding';
import { useAdminName } from '@/hooks/useAdminName';
import { Card } from '@/components/admin/ui/Card';
import { Input } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';
import { useAdminToast } from '@/components/admin/ui/Toast';

export default function StoreDetailsPage() {
  const { toast } = useAdminToast();
  const branding = useBranding();
  const { name: adminName } = useAdminName();
  const updateSetting = useMutation(api.settings.updateStoreSetting);
  const changePasscode = useMutation(api.adminAuth.changePasscode);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', whatsapp: '', address: '' });
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [savingPasscode, setSavingPasscode] = useState(false);

  useEffect(() => {
    setFormData({
      name: branding.name,
      email: branding.email,
      phone: branding.phone,
      whatsapp: branding.whatsapp,
      address: branding.address,
    });
  }, [branding.name, branding.email, branding.phone, branding.whatsapp, branding.address]);

  useEffect(() => {
    setDisplayName(adminName);
  }, [adminName]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(Object.entries(formData).map(([key, value]) => updateSetting({ key, value })));
      toast('Store details saved');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      await updateSetting({ key: 'adminDisplayName', value: displayName.trim() });
      toast('Display name updated');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePasscode = async () => {
    if (newPasscode !== confirmPasscode) {
      toast('New passcode and confirmation do not match');
      return;
    }
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setSavingPasscode(true);
    try {
      const result = await changePasscode({ token, currentPasscode, newPasscode });
      if (result.success) {
        toast('Passcode updated');
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
      } else {
        toast(result.error ?? 'Failed to update passcode');
      }
    } finally {
      setSavingPasscode(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-p-text">Store details</h1>

      <Card title="Your account">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            containerClassName="flex-1 min-w-[200px]"
            label="Display name"
            helpText="What the system calls you across the admin panel."
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button variant="secondary" onClick={handleSaveName} loading={savingName}>Save name</Button>
        </div>
      </Card>

      <Card title="Store details">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Store name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Store email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Store phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="WhatsApp number" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
        </div>
      </Card>

      <Card title="Store address">
        <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
      </Card>

      <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>

      <Card title="Security">
        <p className="text-sm text-p-text-subdued mb-4">Change the passcode used to log in to this admin panel.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Current passcode" type="password" value={currentPasscode} onChange={(e) => setCurrentPasscode(e.target.value)} />
          <Input label="New passcode" type="password" value={newPasscode} onChange={(e) => setNewPasscode(e.target.value)} />
          <Input label="Confirm new passcode" type="password" value={confirmPasscode} onChange={(e) => setConfirmPasscode(e.target.value)} />
        </div>
        <Button
          variant="primary"
          className="mt-4"
          onClick={handleChangePasscode}
          loading={savingPasscode}
          disabled={!currentPasscode || !newPasscode}
        >
          Update passcode
        </Button>
      </Card>
    </div>
  );
}
