'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Mail } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';

export default function AdminMessagesPage() {
  const messages = useQuery(api.messages.listMessages);
  const markRead = useMutation(api.messages.markMessageRead);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="pb-16">
      <PageHeader title="Messages" subtitle="Submissions from the Contact us page" />

      {messages === undefined ? (
        <SkeletonLoader type="text" count={6} />
      ) : messages.length === 0 ? (
        <Card>
          <EmptyState icon={Mail} heading="No messages yet" body="Messages submitted through the Contact us page will show up here." />
        </Card>
      ) : (
        <div className="space-y-3 max-w-[720px]">
          {messages.map((m) => {
            const open = openId === m._id;
            return (
              <Card key={m._id} padding="compact">
                <button
                  className="w-full flex items-center justify-between gap-3 text-left"
                  onClick={() => {
                    setOpenId(open ? null : m._id);
                    if (!m.read) markRead({ id: m._id as Id<'contactMessages'> });
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-p-text truncate">{m.name}</p>
                      {!m.read && <Badge status="info">New</Badge>}
                    </div>
                    <p className="text-[13px] text-p-text-subdued truncate">{m.subject || m.message}</p>
                  </div>
                  <p className="text-[12px] text-p-text-disabled flex-shrink-0">{new Date(m.createdAt).toLocaleDateString()}</p>
                </button>
                {open && (
                  <div className="mt-3 pt-3 border-t border-p-border-subdued text-sm text-p-text space-y-2">
                    <p>{m.message}</p>
                    <a href={`mailto:${m.email}`} className="text-p-focus hover:underline text-[13px] inline-block">{m.email}</a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
