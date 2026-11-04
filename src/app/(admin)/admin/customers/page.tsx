'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminQuery } from '@/hooks/useAdminApi';
import { api } from '../../../../../convex/_generated/api';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Tabs } from '@/components/admin/ui/Tabs';
import { FilterBar } from '@/components/admin/shared/FilterBar';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { Pagination } from '@/components/admin/ui/Pagination';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';

const PAGE_SIZE = 20;

export default function AdminCustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);

  const customers = useAdminQuery(api.customers.listCustomers, {
    search: searchTerm || undefined,
    sortBy: 'lastOrder',
  });

  const filtered = useMemo(() => {
    if (!customers) return undefined;
    if (tab === 'repeat') return customers.filter((c) => c.totalOrders > 1);
    if (tab === 'prospects') return customers.filter((c) => c.totalOrders === 0);
    return customers;
  }, [customers, tab]);

  const pageRows = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];
  const filtering = !!searchTerm || tab !== 'all';

  const columns: DataTableColumn<(typeof pageRows)[number]>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-p-text truncate">{row.name || 'Unknown'}</p>
          <p className="text-xs text-p-text-subdued truncate md:hidden">{row.email || row.phone || ''}</p>
        </div>
      ),
    },
    { key: 'email', label: 'Email', hideOnMobile: true, render: (row) => row.email || '—' },
    { key: 'phone', label: 'Phone', hideOnMobile: true, render: (row) => row.phone || '—' },
    { key: 'totalOrders', label: 'Orders', align: 'right', sortable: true },
    {
      key: 'totalSpent',
      label: 'Amount spent',
      align: 'right',
      sortable: true,
      render: (row) => <span className="tabular-nums">KES {row.totalSpent.toLocaleString()}</span>,
    },
  ];

  return (
    <div className="pb-16">
      <PageHeader title="Customers" subtitle={customers ? `${customers.length} customer${customers.length === 1 ? '' : 's'}` : undefined} />

      <Card padding="compact">
        <div className="-mx-3.5 -mt-3.5 mb-3">
          <Tabs
            tabs={[
              { id: 'all', label: 'All', badge: customers?.length },
              { id: 'repeat', label: 'Repeat customers' },
              { id: 'prospects', label: 'Prospects' },
            ]}
            activeTab={tab}
            onChange={(id) => { setTab(id); setPage(1); }}
          />
        </div>

        <FilterBar
          searchPlaceholder="Search customers..."
          searchValue={searchTerm}
          onSearch={(v) => { setSearchTerm(v); setPage(1); }}
        />

        {!filtered ? (
          <SkeletonLoader type="text" count={8} />
        ) : (
          <DataTable
            columns={columns}
            rows={pageRows}
            onRowClick={(row) => router.push(`/admin/customers/${encodeURIComponent(row.id)}`)}
            emptyState={
              <div className="py-12 text-center">
                <h3 className="text-base font-semibold text-p-text">{filtering ? 'No customers found' : 'No customers yet'}</h3>
                <p className="text-sm text-p-text-subdued mt-1">
                  {filtering ? 'Try changing the filters or search term.' : 'Customers appear here automatically as orders come in.'}
                </p>
              </div>
            }
          />
        )}

        {filtered && filtered.length > 0 && (
          <Pagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
