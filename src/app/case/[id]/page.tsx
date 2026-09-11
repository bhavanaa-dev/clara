import { CaseDashboard } from '@/components/case-review/CaseDashboard';
import { notFound } from 'next/navigation';
import type { Case } from '@/lib/types';

export default async function CaseReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch from API (server-side — safe to call directly)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/cases/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  const caseData = (await res.json()) as Case;

  return <CaseDashboard caseData={caseData} />;
}
