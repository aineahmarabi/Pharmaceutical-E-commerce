'use client';

import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-5">
      <p className="text-sm font-semibold text-p-text-subdued tabular-nums">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-p-text">Page not found</h1>
      <p className="text-sm text-p-text-subdued mt-2 max-w-[360px]">
        This admin page does not exist or may have moved. Check the address or go back to the dashboard.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center justify-center mt-6 h-9 px-4 rounded-lg text-sm font-semibold bg-p-primary text-white hover:bg-p-primary-hover active:scale-[0.97] transition-[background-color,transform] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus focus-visible:ring-offset-2"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
