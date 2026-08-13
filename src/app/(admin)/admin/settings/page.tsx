'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useBranding } from '@/hooks/useBranding';
import { useAdminName } from '@/hooks/useAdminName';
import { Card } from '@/components/admin/ui/Card';
import { Input } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { UploadCloud, X } from 'lucide-react';

export default function StoreDetailsPage() {
  const { toast } = useAdminToast();
  const branding = useBranding();
  const { name: adminName } = useAdminName();
  const updateSetting = useMutation(api.settings.updateStoreSetting);
  const updateLogo = useMutation(api.settings.updateLogo);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const changePasscode = useMutation(api.adminAuth.changePasscode);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', whatsapp: '', address: '', mapLink: '' });
  const [saving, setSaving] = useState(false);

  const [socialLinks, setSocialLinks] = useState({ twitter: '', instagram: '', facebook: '' });
  const [savingSocial, setSavingSocial] = useState(false);

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
      mapLink: branding.mapLink,
    });
  }, [branding.name, branding.email, branding.phone, branding.whatsapp, branding.address, branding.mapLink]);

  useEffect(() => {
    setSocialLinks({
      twitter: branding.socialLinks?.twitter ?? '',
      instagram: branding.socialLinks?.instagram ?? '',
      facebook: branding.socialLinks?.facebook ?? '',
    });
  }, [branding.socialLinks?.twitter, branding.socialLinks?.instagram, branding.socialLinks?.facebook]);

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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateLogo({ storageId });
      toast('Logo updated');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    setRemovingLogo(true);
    try {
      await updateSetting({ key: 'logo', value: null });
      toast('Logo removed');
    } finally {
      setRemovingLogo(false);
    }
  };

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    try {
      await updateSetting({ key: 'socialLinks', value: socialLinks });
      toast('Social links saved');
    } finally {
      setSavingSocial(false);
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

      <Card title="Logo">
        <p className="text-sm text-p-text-subdued mb-4">Shown in the admin sidebar, storefront header, and used as the browser tab icon.</p>
        <div className="flex items-center gap-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped && dropped.type.startsWith('image/')) {
                const dt = new DataTransfer();
                dt.items.add(dropped);
                if (logoInputRef.current) {
                  logoInputRef.current.files = dt.files;
                  await handleLogoChange({ target: logoInputRef.current } as React.ChangeEvent<HTMLInputElement>);
                }
              }
            }}
            onClick={() => logoInputRef.current?.click()}
            className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-dashed border-p-border bg-p-bg flex items-center justify-center cursor-pointer hover:bg-p-bg-surface transition-colors overflow-hidden"
          >
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
            {branding.logo ? (
              <img src={branding.logo} alt={branding.name} className="w-full h-full object-contain" />
            ) : (
              <UploadCloud size={20} className="text-p-icon" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => logoInputRef.current?.click()} loading={uploadingLogo}>
                {branding.logo ? 'Replace logo' : 'Upload logo'}
              </Button>
              {branding.logo && (
                <Button variant="plain" icon={X} onClick={handleRemoveLogo} loading={removingLogo}>
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-p-text-subdued">Square image recommended, PNG or SVG with a transparent background.</p>
          </div>
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
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <Input
            label="Google Maps pin or link"
            placeholder="https://maps.google.com/?q=..."
            helpText="Paste a Google Maps share link, or a place/pin URL. Shown on the Contact page and used for pickup directions at checkout."
            value={formData.mapLink}
            onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
          />
        </div>
      </Card>

      <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>

      <Card title="Social links">
        <p className="text-sm text-p-text-subdued mb-4">Shown as icons in the storefront footer. Leave blank to hide an icon.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="X (Twitter) URL" placeholder="https://x.com/yourstore" value={socialLinks.twitter} onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })} />
          <Input label="Instagram URL" placeholder="https://instagram.com/yourstore" value={socialLinks.instagram} onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} />
          <Input label="Facebook URL" placeholder="https://facebook.com/yourstore" value={socialLinks.facebook} onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} />
        </div>
        <Button variant="primary" className="mt-4" onClick={handleSaveSocial} loading={savingSocial}>Save social links</Button>
      </Card>

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
