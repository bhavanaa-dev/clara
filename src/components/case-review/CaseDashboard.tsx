'use client';

import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { AlertCircle, CalendarDays, Scale } from 'lucide-react';
import { CaseOverview } from './CaseOverview';
import { Timeline } from './Timeline';
import { EvidenceList } from './EvidenceList';
import { LegalInfo } from './LegalInfo';
import { VerificationPanel } from './VerificationPanel';
import { ActionPacket } from './ActionPacket';
import { StatusBadge } from './StatusBadge';
import type { Case } from '@/lib/types';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'legal', label: 'Legal Info' },
  { id: 'verification', label: 'Verification' },
  { id: 'action', label: 'Action Packet' },
] as const;

export function CaseDashboard({ caseData }: { caseData: Case }) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
                    <Scale className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </span>
                  <span className="text-xl font-bold tracking-tight text-gray-900">CLARA</span>
                </span>
                <StatusBadge status={caseData.status} />
              </div>
              <h1 className="mt-1.5 truncate text-base font-bold text-gray-900">
                {caseData.issueTypeLabel ?? 'Your case'}
              </h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-gray-500">
                <span className="font-mono text-xs tracking-wide">
                  Case {caseData.id.slice(0, 8).toUpperCase()}
                </span>
                <span aria-hidden="true" className="text-gray-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                  {new Date(caseData.createdAt).toLocaleDateString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </div>
            {caseData.severity && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap',
                  caseData.severity === 'CRITICAL' && 'border-rose-200 bg-rose-50 text-rose-700',
                  caseData.severity === 'HIGH' && 'border-orange-200 bg-orange-50 text-orange-700',
                  caseData.severity === 'MEDIUM' && 'border-amber-200 bg-amber-50 text-amber-700',
                  caseData.severity === 'LOW' && 'border-emerald-200 bg-emerald-50 text-emerald-700'
                )}
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                {caseData.severity.charAt(0) + caseData.severity.slice(1).toLowerCase()} severity
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {caseData.status === 'ERROR' && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-800 shadow-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <p>
              <strong>Processing Error:</strong>{' '}
              {caseData.errorMessage ?? 'An unknown error occurred. Please try again.'}
            </p>
          </div>
        )}

        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List
            aria-label="Case sections"
            className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm"
          >
            {TABS.map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex-shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                )}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="overview">
            <CaseOverview caseData={caseData} />
          </Tabs.Content>

          <Tabs.Content value="timeline">
            <Timeline entries={caseData.timeline} />
          </Tabs.Content>

          <Tabs.Content value="evidence">
            <EvidenceList evidence={caseData.evidence} />
          </Tabs.Content>

          <Tabs.Content value="legal">
            <LegalInfo items={caseData.actionPacket?.relevantLegalInfo ?? []} />
          </Tabs.Content>

          <Tabs.Content value="verification">
            <VerificationPanel results={caseData.verificationResults} />
          </Tabs.Content>

          <Tabs.Content value="action">
            {caseData.actionPacket ? (
              <ActionPacket packet={caseData.actionPacket} caseId={caseData.id} />
            ) : (
              <p className="text-sm text-gray-500">
                The action packet has not been generated yet.
              </p>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
