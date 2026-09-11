'use client';

import { AlertCircle, Compass, ListChecks, Scale } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Case } from '@/lib/types';

export function CaseOverview({ caseData }: { caseData: Case }) {
  const severityPill: Record<string, string> = {
    LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
    HIGH: 'border-orange-200 bg-orange-50 text-orange-700',
    CRITICAL: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      {caseData.actionPacket?.caseSummary && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Case summary
          </p>
          <p className="text-sm leading-relaxed text-indigo-900">
            {caseData.actionPacket.caseSummary}
          </p>
        </div>
      )}

      {/* Key details grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <DetailCard label="Issue Type" value={caseData.issueTypeLabel ?? caseData.issueType ?? '—'} />
        {caseData.severity ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">Severity</p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${severityPill[caseData.severity] ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
              {caseData.severity.charAt(0) + caseData.severity.slice(1).toLowerCase()}
            </span>
          </div>
        ) : (
          <DetailCard label="Severity" value="—" />
        )}
        <DetailCard label="Location" value={caseData.location} />
        {caseData.tenantName && (
          <DetailCard label="Tenant" value={caseData.tenantName} />
        )}
        {caseData.landlordName && (
          <DetailCard label="Landlord" value={caseData.landlordName} />
        )}
        {caseData.propertyAddress && (
          <DetailCard label="Property" value={caseData.propertyAddress} />
        )}
        <DetailCard
          label="Landlord Notified"
          value={
            caseData.landlordNotified
              ? 'Yes'
              : caseData.landlordNotified === false
                ? 'No'
                : 'Unknown'
          }
        />
        {caseData.landlordResponse && (
          <DetailCard label="Landlord Response" value={caseData.landlordResponse} />
        )}
      </div>

      {/* Applicability */}
      {caseData.applicability && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Scale className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              Legal Applicability
            </h3>
            <StatusBadge status={caseData.applicability.status} />
          </div>
          {caseData.applicability.status === 'UNCERTAIN' && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              <strong>What “Uncertain” means:</strong> CLARA could not conclusively match your
              facts to a legal provision. This is an informational assessment, not a legal
              finding — the reasons and limitations below explain why. When in doubt, consult a
              qualified advocate.
            </p>
          )}
          <ul className="list-disc space-y-1.5 pl-5">
            {caseData.applicability.reasons.map((r, i) => (
              <li key={i} className="text-sm leading-relaxed text-gray-700">
                {r}
              </li>
            ))}
          </ul>
          {caseData.applicability.limitations.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                Limitations
              </p>
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                <div className="space-y-1">
                  {caseData.applicability.limitations.map((l, i) => (
                    <p key={i} className="text-xs leading-relaxed text-amber-800">
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Missing information */}
      {caseData.missingInformation.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <ListChecks className="h-4 w-4 text-amber-700" aria-hidden="true" />
            Missing Information
          </h3>
          <p className="mb-2.5 text-xs leading-relaxed text-amber-700">
            Providing the following would strengthen your case:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            {caseData.missingInformation.map((m, i) => (
              <li key={i} className="text-sm leading-relaxed text-amber-800">
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended next step */}
      {caseData.actionPacket?.recommendedNextStep && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <Compass className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            Recommended Next Step
          </h3>
          <p className="text-sm leading-relaxed text-indigo-800">{caseData.actionPacket.recommendedNextStep}</p>
        </div>
      )}
    </div>
  );
}

function DetailCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-sm font-medium break-words text-gray-900 ${valueClassName ?? ''}`}>{value}</p>
    </div>
  );
}
