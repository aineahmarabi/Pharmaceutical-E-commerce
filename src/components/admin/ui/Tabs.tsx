'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b border-p-border-subdued" role="tablist">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={cn(
                'shrink-0 px-3 sm:px-4 h-11 text-sm border-b-2 -mb-px transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-p-focus rounded-t-md',
                active
                  ? 'text-p-text font-semibold border-p-primary'
                  : 'text-p-text-subdued font-medium border-transparent hover:text-p-text hover:bg-p-bg-surface-hover'
              )}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'ml-1.5 text-xs tabular-nums rounded-full px-1.5 py-0.5',
                    active ? 'bg-p-bg-surface-selected text-p-text-primary' : 'bg-p-bg-surface-active text-p-text-subdued'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
