'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';

const PHONE_RE = /^[0-9+()\s-]{7,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILES = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const inputCls =
  'w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-fg focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/40 transition-colors';
const labelCls = 'block text-sm font-medium text-ink mb-1.5';
const errCls = 'mt-1.5 text-xs text-signal';
const btnPrimary =
  'inline-flex h-11 items-center justify-center rounded-lg bg-petrol px-6 text-sm font-medium text-white transition-transform duration-100 hover:bg-petrol-700 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Received. A pharmacist will review it.',
  approved: 'Approved.',
  rejected: 'Not approved.',
  needs_info: 'We need more information.',
};

type Item = { id: string; file: File; preview: string | null };
type Errors = Partial<Record<'name' | 'phone' | 'email' | 'files' | 'form', string>>;

function formatSize(n: number) {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

function UploadForm() {
  const generateUploadUrl = useMutation(api.files.generatePrescriptionUploadUrl);
  const submit = useMutation(api.prescriptions.submit);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [items, setItems] = useState<Item[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Item[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => itemsRef.current.forEach((i) => i.preview && URL.revokeObjectURL(i.preview)), []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const addFiles = (list: FileList | File[]) => {
    const next = [...items];
    let problem = '';
    for (const file of Array.from(list)) {
      if (!TYPES.includes(file.type)) problem = `${file.name}: use JPG, PNG, WebP or PDF.`;
      else if (file.size > MAX_BYTES) problem = `${file.name} is over 8 MB.`;
      else if (next.length >= MAX_FILES) problem = 'You can attach up to 5 files.';
      else
        next.push({
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        });
    }
    setItems(next);
    setErrors((e) => ({ ...e, files: problem || undefined }));
  };

  const remove = (id: string) => {
    setItems((cur) => {
      const gone = cur.find((i) => i.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return cur.filter((i) => i.id !== id);
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your name.';
    if (!PHONE_RE.test(form.phone.trim())) errs.phone = 'Enter a valid phone number.';
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email.';
    if (items.length === 0) errs.files = 'Add at least one photo or PDF.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const ids: Id<'_storage'>[] = [];
      for (const it of items) {
        const url = await generateUploadUrl();
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': it.file.type }, body: it.file });
        if (!res.ok) throw new Error('Upload failed');
        const { storageId } = (await res.json()) as { storageId: Id<'_storage'> };
        ids.push(storageId);
      }
      const out = await submit({
        customerName: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
        fileIds: ids,
      });
      setReference(out.reference);
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      const m = raw.match(/Uncaught Error:\s*([^\n]+)/);
      setErrors({ form: m ? m[1] : 'Could not send. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  if (reference) {
    return (
      <div className="space-y-3" role="status">
        <h2 className="text-xl font-semibold tracking-tight text-ink">Prescription received</h2>
        <p className="text-sm text-muted-fg">Your reference</p>
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink">{reference}</p>
        <p className="text-sm text-muted-fg">
          A pharmacist will review it and contact you on {form.phone.trim()}. Check status below with this reference.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="rx-name" className={labelCls}>Full name</label>
        <input id="rx-name" value={form.name} onChange={set('name')} autoComplete="name" className={inputCls} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'rx-name-err' : undefined} />
        {errors.name && <p id="rx-name-err" className={errCls}>{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="rx-phone" className={labelCls}>Phone</label>
        <input id="rx-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="0712 345 678" className={inputCls} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'rx-phone-err' : undefined} />
        {errors.phone && <p id="rx-phone-err" className={errCls}>{errors.phone}</p>}
      </div>
      <div>
        <label htmlFor="rx-email" className={labelCls}>Email <span className="font-normal text-muted-fg">(optional)</span></label>
        <input id="rx-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" className={inputCls} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'rx-email-err' : undefined} />
        {errors.email && <p id="rx-email-err" className={errCls}>{errors.email}</p>}
      </div>

      <div>
        <span id="rx-files-label" className={labelCls}>Prescription</span>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
          className={`rounded-lg border border-dashed p-6 text-center transition-colors ${drag ? 'border-petrol bg-petrol-50' : 'border-line bg-porcelain'}`}
        >
          <p className="text-sm text-ink">Drop files here or</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-describedby="rx-files-label rx-files-hint"
            className="mt-2 inline-flex h-10 items-center rounded-lg border border-line bg-paper px-4 text-sm font-medium text-ink transition-transform duration-100 hover:border-petrol active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
          >
            Choose files
          </button>
          <p id="rx-files-hint" className="mt-2 text-xs text-muted-fg">JPG, PNG, WebP or PDF. Up to 5 files, 8 MB each.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-label="Prescription files"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
          />
        </div>
        {errors.files && <p className={errCls} role="alert">{errors.files}</p>}
        {items.length > 0 && (
          <ul className="mt-3 space-y-2">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 rounded-lg border border-line bg-paper p-2">
                {it.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.preview} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-line bg-porcelain text-xs font-medium text-muted-fg">PDF</span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{it.file.name}</span>
                  <span className="block text-xs text-muted-fg">{formatSize(it.file.size)}</span>
                </span>
                <button type="button" onClick={() => remove(it.id)} aria-label={`Remove ${it.file.name}`} className="rounded-md px-2 py-1 text-sm text-muted-fg hover:text-signal focus:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="rx-notes" className={labelCls}>Notes <span className="font-normal text-muted-fg">(optional)</span></label>
        <textarea id="rx-notes" value={form.notes} onChange={set('notes')} rows={3} maxLength={1000} className={inputCls} />
      </div>

      {errors.form && <p className="text-sm text-signal" role="alert">{errors.form}</p>}
      <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Sending' : 'Send prescription'}</button>
    </form>
  );
}

function StatusCheck() {
  const [ref, setRef] = useState('');
  const [phone, setPhone] = useState('');
  const [args, setArgs] = useState<{ reference: string; phone: string } | null>(null);
  const [error, setError] = useState('');
  const result = useQuery(api.prescriptions.status, args ?? 'skip');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim() || !PHONE_RE.test(phone.trim())) {
      setError('Enter your reference and phone number.');
      setArgs(null);
      return;
    }
    setError('');
    setArgs({ reference: ref.trim(), phone: phone.trim() });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="st-ref" className={labelCls}>Reference</label>
          <input id="st-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="RX-1001" autoComplete="off" className={inputCls} />
        </div>
        <div>
          <label htmlFor="st-phone" className={labelCls}>Phone</label>
          <input id="st-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className={inputCls} />
        </div>
      </div>
      {error && <p className="text-xs text-signal" role="alert">{error}</p>}
      <button type="submit" className="inline-flex h-11 items-center rounded-lg border border-line bg-paper px-6 text-sm font-medium text-ink transition-transform duration-100 hover:border-petrol active:scale-[0.97]">
        Check status
      </button>
      <div aria-live="polite">
        {args && result === undefined && <p className="text-sm text-muted-fg">Checking</p>}
        {args && result === null && <p className="text-sm text-signal">No prescription found for that reference and phone.</p>}
        {result && (
          <div className="rounded-lg border border-line bg-porcelain p-4">
            <p className="text-sm text-muted-fg">{result.reference}</p>
            <p className="mt-1 text-base font-semibold text-ink">{STATUS_LABEL[result.status]}</p>
            {result.pharmacistNote && <p className="mt-2 whitespace-pre-line text-sm text-ink">{result.pharmacistNote}</p>}
          </div>
        )}
      </div>
    </form>
  );
}

export default function PrescriptionPage() {
  return (
    <div className="min-h-screen bg-porcelain py-6 sm:py-8">
      <div className="mx-auto max-w-xl space-y-4 px-4 sm:px-6">
        <section className="rounded-xl border border-line bg-paper p-4 sm:p-6">
          <h1 className="mb-5 text-2xl font-semibold tracking-tight text-ink">Upload prescription</h1>
          <UploadForm />
        </section>
        <section className="rounded-xl border border-line bg-paper p-4 sm:p-6">
          <h2 className="mb-5 text-xl font-semibold tracking-tight text-ink">Check status</h2>
          <StatusCheck />
        </section>
      </div>
    </div>
  );
}
