'use client';

import React from 'react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../convex/_generated/api';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';

export default function AdminNewsletterPage() {
  const subscribers = useAdminQuery(api.newsletter.listSubscribers, {});
  const unsubscribe = useAdminMutation(api.newsletter.unsubscribe);
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
        subtitle={activeCount !== undefined ? `${activeCount} active subscriber${activeCount === 1 ? '' : 's'}` : 'Emails collected from the storefront signup'}
        primaryAction={{ label: 'Export CSV', onClick: handleExport }}
      />

      {subscribers === undefined ? (
        <SkeletonLoader type="text" count={6} />
      ) : subscribers.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <h3 className="text-base font-semibold text-p-text">No subscribers yet</h3>
            <p className="text-sm text-p-text-subdued mt-1">Emails collected from the newsletter signup will show up here.</p>
          </div>
        </Card>
      ) : (
        <Card padding="compact" className="max-w-[860px] overflow-hidden">
          <div className="-m-3.5 overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-p-bg h-10 text-xs font-semibold text-p-text-subdued border-b border-p-border-subdued">
                  <th className="text-left px-5">Email</th>
                  <th className="text-left px-5">Status</th>
                  <th className="text-left px-5">Subscribed</th>
                  <th className="px-5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s._id} className="h-12 border-b border-p-border-subdued last:border-0 text-sm hover:bg-p-bg transition-colors">
                    <td className="px-5 text-p-text">{s.email}</td>
                    <td className="px-5">
                      <Badge status={s.subscribed ? 'success' : 'default'}>{s.subscribed ? 'Subscribed' : 'Unsubscribed'}</Badge>
                    </td>
                    <td className="px-5 text-p-text-subdued whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 text-right whitespace-nowrap">
                      {s.subscribed && (
                        <button
                          onClick={async () => {
                            await unsubscribe({ email: s.email });
                            toast('Subscriber removed');
                          }}
                          aria-label={`Unsubscribe ${s.email}`}
                          className="text-sm text-p-critical hover:underline"
                        >
                          Unsubscribe
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
