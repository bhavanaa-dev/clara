'use client';

import { StatusBadge } from './StatusBadge';
import { BadgeCheck, ExternalLink, FileSearch } from 'lucide-react';
import type { VerificationResult } from '@/lib/types';

export function VerificationPanel({ results }: { results: VerificationResult[] }) {
  if (results.length === 0) {
    return (
      <div className="flex gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <FileSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-700">Nothing to verify yet</p>
          <p className="mt-0.5 text-sm text-gray-500">
            No verification results available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm">
        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-indigo-900">
          Each claim extracted from your evidence has been checked against the CLARA trusted legal
          corpus. Results reflect what the available legal provisions support — not a legal
          determination.
        </p>
      </div>

      {results.map((result) => (
        <div
          key={result.id}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
            <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed text-gray-900">
              &ldquo;{result.claim}&rdquo;
            </p>
            <StatusBadge status={result.status} className="shrink-0" />
          </div>

          <p className="mb-3 text-sm leading-relaxed text-gray-700">{result.reasoning}</p>

          {result.sourceProvisionTitle && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <p className="text-xs font-semibold text-indigo-800">{result.sourceProvisionTitle}</p>
              {result.sourceText && (
                <p className="mt-1 text-xs italic leading-relaxed text-indigo-700">&ldquo;{result.sourceText}&rdquo;</p>
              )}
              {result.sourceUrl && (
                <a
                  href={result.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 rounded text-xs font-medium text-indigo-600 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  View source <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          {result.missingInformation && (
            <p className="mt-2.5 rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">
              <span className="font-semibold">Still needed: </span>
              {result.missingInformation}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-500">
              Confidence: <span className="font-semibold text-gray-700">{result.confidence.charAt(0) + result.confidence.slice(1).toLowerCase()}</span>
            </span>
            <span aria-hidden="true" className="text-gray-200">·</span>
            <StatusBadge status={result.applicabilityStatus} />
          </div>
        </div>
      ))}
    </div>
  );
}
