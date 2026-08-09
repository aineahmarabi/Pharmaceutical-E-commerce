'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Users } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Tabs } from '@/components/admin/ui/Tabs';
import { FilterBar } from '@/components/admin/shared/FilterBar';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { Pagination } from '@/components/admin/ui/Pagination';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';

const PAGE_SIZE = 20;

export default function AdminCustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);

  const customers = useQuery(api.customers.listCustomers, {
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

  const columns: DataTableColumn<any>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <button
          onClick={() => router.push(`/admin/customers/${encodeURIComponent(row.id)}`)}
          className="font-medium text-p-focus text-left"
        >
          {row.name || 'Unknown'}
        </button>
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
      render: (row) => `KES ${row.totalSpent.toLocaleString()}`,
    },
  ];

  return (
    <div className="pb-16">
      <PageHeader title="Customers" />

      <Card>
        <div className="-mx-5 -mt-5 mb-4">
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
              <EmptyState
                icon={Users}
                heading={searchTerm || tab !== 'all' ? 'No customers found' : 'Everything customers-related in one place'}
                body={searchTerm || tab !== 'all' ? 'Try changing the filters or search term.' : 'Customers will appear here automatically as orders come in.'}
              />
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
