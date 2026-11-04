import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Prescription',
};

export default function PrescriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
