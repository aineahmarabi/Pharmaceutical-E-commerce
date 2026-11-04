'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../convex/_generated/api';
import { useBranding } from '@/hooks/useBranding';
import { useAdminName } from '@/hooks/useAdminName';
import { Card } from '@/components/admin/ui/Card';
import { Input } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';
import { ContextualSaveBar } from '@/components/admin/ui/ContextualSaveBar';
import { useAdminToast } from '@/components/admin/ui/Toast';

export default function StoreDetailsPage() {
  const { toast } = useAdminToast();
  const branding = useBranding();
  const { name: adminName } = useAdminName();
  const updateSetting = useAdminMutation(api.settings.updateStoreSetting);
  const updateLogo = useAdminMutation(api.settings.updateLogo);
  const generateUploadUrl = useAdminMutation(api.files.generateUploadUrl);
  const changePasscode = useMutation(api.adminAuth.changePasscode);

  const allSettings = useQuery(api.settings.getStoreSettings);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', whatsapp: '', address: '', mapLink: '' });
  const [saving, setSaving] = useState(false);

  const [pharmacy, setPharmacy] = useState({ pharmacistName: '', ppbLicenceNumber: '', ppbLicenceExpiry: '', lowStockThreshold: '', showOutOfStock: 'true' });
  const savedPharmacy = {
    pharmacistName: String(allSettings?.find((s) => s.key === 'pharmacistName')?.value ?? ''),
    ppbLicenceNumber: String(allSettings?.find((s) => s.key === 'ppbLicenceNumber')?.value ?? ''),
    ppbLicenceExpiry: String(allSettings?.find((s) => s.key === 'ppbLicenceExpiry')?.value ?? ''),
    lowStockThreshold: String(allSettings?.find((s) => s.key === 'lowStockThreshold')?.value ?? ''),
    // On unless the admin switched it off.
    showOutOfStock: String(!['false', false].includes(allSettings?.find((s) => s.key === 'showOutOfStock')?.value as string | boolean)),
  };
  const savedPharmacyKey = JSON.stringify(savedPharmacy);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form when saved settings change
    setPharmacy(JSON.parse(savedPharmacyKey));
  }, [savedPharmacyKey]);

  const [socialLinks, setSocialLinks] = useState({ twitter: '', instagram: '', facebook: '' });

  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [savingPasscode, setSavingPasscode] = useState(false);

  const savedForm = {
    name: branding.name,
    email: branding.email,
    phone: branding.phone,
    whatsapp: branding.whatsapp,
    address: branding.address,
    mapLink: branding.mapLink,
  };
  const savedSocial = {
    twitter: branding.socialLinks?.twitter ?? '',
    instagram: branding.socialLinks?.instagram ?? '',
    facebook: branding.socialLinks?.facebook ?? '',
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync editable fields from saved branding
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync editable fields from saved social links
    setSocialLinks({
      twitter: branding.socialLinks?.twitter ?? '',
      instagram: branding.socialLinks?.instagram ?? '',
      facebook: branding.socialLinks?.facebook ?? '',
    });
  }, [branding.socialLinks?.twitter, branding.socialLinks?.instagram, branding.socialLinks?.facebook]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync editable field from saved name
    setDisplayName(adminName);
  }, [adminName]);

  const formDirty = (Object.keys(savedForm) as (keyof typeof savedForm)[]).some((k) => formData[k] !== savedForm[k]);
  const socialDirty = (Object.keys(savedSocial) as (keyof typeof savedSocial)[]).some((k) => socialLinks[k] !== savedSocial[k]);
  const pharmacyDirty = (Object.keys(savedPharmacy) as (keyof typeof savedPharmacy)[]).some((k) => pharmacy[k] !== savedPharmacy[k]);
  const isDirty = formDirty || socialDirty || pharmacyDirty;

  const handleDiscard = () => {
    setFormData(savedForm);
    setSocialLinks(savedSocial);
    setPharmacy(savedPharmacy);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (formDirty) {
        await Promise.all(Object.entries(formData).map(([key, value]) => updateSetting({ key, value })));
      }
      if (socialDirty) {
        await updateSetting({ key: 'socialLinks', value: socialLinks });
      }
      if (pharmacyDirty) {
        await Promise.all(
          (Object.keys(pharmacy) as (keyof typeof pharmacy)[])
            .filter((k) => pharmacy[k] !== savedPharmacy[k])
            .map((k) => {
              const raw = pharmacy[k].trim();
              const value =
                k === 'lowStockThreshold' ? (raw === '' ? null : Math.max(0, Math.floor(Number(raw)) || 0))
                : k === 'showOutOfStock' ? raw === 'true'
                : raw;
              return updateSetting({ key: k, value });
            }),
        );
      }
      toast('Settings saved');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const postUrl = await generateUploadUrl({});
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
    <div className="space-y-4">
      <ContextualSaveBar isDirty={isDirty} onSave={handleSave} onDiscard={handleDiscard} saving={saving} />

      <div>
        <h2 className="text-xl font-semibold text-p-text">Store details</h2>
        <p className="text-sm text-p-text-subdued mt-0.5">Contact information, branding and account security.</p>
      </div>

      <Card title="Store profile">
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
            helpText="Shown on the Contact page and used for pickup directions at checkout."
            value={formData.mapLink}
            onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
          />
        </div>
      </Card>

      <Card title="Pharmacy details">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Superintending pharmacist" helpText="Shown in the storefront footer and About page when set." value={pharmacy.pharmacistName} onChange={(e) => setPharmacy({ ...pharmacy, pharmacistName: e.target.value })} />
          <Input label="PPB licence number" value={pharmacy.ppbLicenceNumber} onChange={(e) => setPharmacy({ ...pharmacy, ppbLicenceNumber: e.target.value })} />
          <Input label="PPB licence expiry (optional)" type="date" value={pharmacy.ppbLicenceExpiry} onChange={(e) => setPharmacy({ ...pharmacy, ppbLicenceExpiry: e.target.value })} />
          <Input
            label="Low stock alert level"
            type="number"
            min={0}
            placeholder="5"
            helpText="Alert when a product falls to this many units. Default 5."
            value={pharmacy.lowStockThreshold}
            onChange={(e) => setPharmacy({ ...pharmacy, lowStockThreshold: e.target.value })}
          />
          <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={pharmacy.showOutOfStock === 'true'}
              onChange={(e) => setPharmacy({ ...pharmacy, showOutOfStock: e.target.checked ? 'true' : 'false' })}
            />
            <span>
              <span className="block text-sm font-medium text-p-text">Show sold-out products on the storefront</span>
              <span className="block text-xs text-p-text-subdued">
                They stay visible with an &ldquo;Out of stock&rdquo; stamp and cannot be added to the cart. Switch off to hide them until restocked.
              </span>
            </span>
          </label>
        </div>
      </Card>

      <Card title="Branding">
        <p className="text-sm text-p-text-subdued mb-4">The logo is used in the admin sidebar and as the browser tab icon. Logo changes apply immediately.</p>
        <div className="flex items-center gap-4">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload logo"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); logoInputRef.current?.click(); } }}
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
            className="w-20 h-20 flex-shrink-0 rounded-xl border border-dashed border-p-border bg-p-bg flex items-center justify-center cursor-pointer hover:bg-p-bg-surface-hover transition-colors overflow-hidden text-xs text-p-text-subdued text-center"
          >
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
            {branding.logo ? (
              <img src={branding.logo} alt={branding.name} className="w-full h-full object-contain" />
            ) : (
              <span className="px-2">Drop image</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => logoInputRef.current?.click()} loading={uploadingLogo}>
                {branding.logo ? 'Replace logo' : 'Upload logo'}
              </Button>
              {branding.logo && (
                <Button variant="plain" onClick={handleRemoveLogo} loading={removingLogo}>
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-p-text-subdued">Square image recommended. PNG or SVG with a transparent background.</p>
          </div>
        </div>
      </Card>

      <Card title="Social links">
        <p className="text-sm text-p-text-subdued mb-4">Shown in the storefront footer. Leave blank to hide a link.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="X (Twitter) URL" placeholder="https://x.com/yourstore" value={socialLinks.twitter} onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })} />
          <Input label="Instagram URL" placeholder="https://instagram.com/yourstore" value={socialLinks.instagram} onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} />
          <Input label="Facebook URL" placeholder="https://facebook.com/yourstore" value={socialLinks.facebook} onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} />
        </div>
      </Card>

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

      <Card title="Security">
        <p className="text-sm text-p-text-subdued mb-4">Change the passcode used to log in to this admin panel.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Current passcode" type="password" value={currentPasscode} onChange={(e) => setCurrentPasscode(e.target.value)} />
          <Input label="New passcode" type="password" value={newPasscode} onChange={(e) => setNewPasscode(e.target.value)} />
          <Input label="Confirm new passcode" type="password" value={confirmPasscode} onChange={(e) => setConfirmPasscode(e.target.value)} />
        </div>
        <Button
          variant="secondary"
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
