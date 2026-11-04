'use client';

import React, { useState } from 'react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { cn } from '@/lib/utils';

export default function AdminMessagesPage() {
  const messages = useAdminQuery(api.messages.listMessages, {});
  const markRead = useAdminMutation(api.messages.markMessageRead);
  const [openId, setOpenId] = useState<string | null>(null);
  const unread = messages?.filter((m) => !m.read).length;

  return (
    <div className="pb-16">
      <PageHeader
        title="Messages"
        subtitle={unread !== undefined ? `${unread} unread. Submissions from the Contact page.` : 'Submissions from the Contact page'}
      />

      {messages === undefined ? (
        <SkeletonLoader type="text" count={6} />
      ) : messages.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <h3 className="text-base font-semibold text-p-text">No messages yet</h3>
            <p className="text-sm text-p-text-subdued mt-1">Messages sent through the Contact page will show up here.</p>
          </div>
        </Card>
      ) : (
        <Card padding="compact" className="max-w-[860px] overflow-hidden">
          <ul className="-m-3.5 divide-y divide-p-border-subdued">
            {messages.map((m) => {
              const open = openId === m._id;
              return (
                <li key={m._id} className={cn(open && 'bg-p-bg')}>
                  <button
                    className="w-full flex items-start justify-between gap-4 px-5 py-3.5 text-left hover:bg-p-bg transition-colors"
                    aria-expanded={open}
                    onClick={() => {
                      setOpenId(open ? null : m._id);
                      if (!m.read) markRead({ id: m._id as Id<'contactMessages'> });
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-sm text-p-text truncate', m.read ? 'font-medium' : 'font-semibold')}>{m.name}</p>
                        {!m.read && <Badge status="info">New</Badge>}
                      </div>
                      <p className={cn('text-sm truncate text-p-text-subdued', open && 'hidden')}>{m.subject || m.message}</p>
                    </div>
                    <p className="text-xs text-p-text-subdued flex-shrink-0 pt-0.5">{new Date(m.createdAt).toLocaleDateString()}</p>
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-sm text-p-text space-y-3">
                      {m.subject && <p className="font-medium">{m.subject}</p>}
                      <p className="whitespace-pre-line leading-relaxed">{m.message}</p>
                      <a href={`mailto:${m.email}`} className="text-p-focus hover:underline inline-block">{m.email}</a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
