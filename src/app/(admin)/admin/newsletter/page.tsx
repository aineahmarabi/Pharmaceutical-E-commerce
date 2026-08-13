'use client';

import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Mail, Download, X } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';

export default function AdminNewsletterPage() {
  const subscribers = useQuery(api.newsletter.listSubscribers);
  const unsubscribe = useMutation(api.newsletter.unsubscribe);
  const { toast } = useAdminToast();

  const activeCount = subscribers?.filter((s) => s.subscribed).length;

  const handleExport = () => {
    if (!subscribers || subscribers.length === 0) return;
    const rows = ['email,status,subscribed_at', ...subscribers.map((s) =>
      `${s.email},${s.subscribed ? 'subscribed' : 'unsubscribed'},${new Date(s.createdAt).toISOString()}`
    )];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-16">
      <PageHeader
        title="Newsletter"
        subtitle={activeCount !== undefined ? `${activeCount} active subscriber${activeCount === 1 ? '' : 's'}` : 'Emails collected from the homepage signup'}
        primaryAction={{ label: 'Export CSV', icon: Download, onClick: handleExport }}
      />

      {subscribers === undefined ? (
        <SkeletonLoader type="text" count={6} />
      ) : subscribers.length === 0 ? (
        <Card>
          <EmptyState icon={Mail} heading="No subscribers yet" body="Emails collected from the newsletter signup on the homepage will show up here." />
        </Card>
      ) : (
        <div className="max-w-[720px]">
          <Card padding="compact">
            <div className="space-y-1">
              {subscribers.map((s) => (
                <div key={s._id} className="flex items-center justify-between gap-3 px-1.5 py-2 border-b border-p-border-subdued last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm text-p-text truncate">{s.email}</p>
                    {!s.subscribed && <Badge status="default">Unsubscribed</Badge>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-[12px] text-p-text-disabled">{new Date(s.createdAt).toLocaleDateString()}</p>
                    {s.subscribed && (
                      <button
                        onClick={async () => {
                          await unsubscribe({ email: s.email });
                          toast('Subscriber removed');
                        }}
                        aria-label={`Unsubscribe ${s.email}`}
                        className="text-p-icon-subdued hover:text-p-critical hover:bg-p-critical-subdued rounded p-1 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
