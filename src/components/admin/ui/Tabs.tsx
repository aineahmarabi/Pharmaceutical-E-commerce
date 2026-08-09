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
                'shrink-0 px-4 py-3 text-sm border-b-[3px] -mb-px transition-colors',
                'focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-p-focus)] rounded-t',
                active
                  ? 'text-p-text font-semibold border-p-primary'
                  : 'text-p-text-subdued font-medium border-transparent hover:text-p-text hover:bg-p-bg'
              )}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-1.5 text-p-text-subdued">({tab.badge})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
