'use client';

import { ExternalLink, LibraryBig, Scale } from 'lucide-react';
import type { LegalInfoItem } from '@/lib/types';

export function LegalInfo({ items }: { items: LegalInfoItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <LibraryBig className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-700">No provisions matched</p>
          <p className="mt-0.5 text-sm text-gray-500">
            No relevant legal provisions were found for this case.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <Scale className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-amber-800">
          <strong>Note:</strong> The provisions below are sourced from the CLARA trusted legal corpus
          (Karnataka Rent Control Act 1961, Transfer of Property Act 1882, Model Tenancy Act 2021).
          They are provided for informational purposes only and are not legal advice. Verify with
          official sources and consult a qualified advocate.
        </p>
      </div>

      {items.map((item) => (
        <div
          key={item.provisionId}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {item.actName}
              </p>
              <h4 className="mt-0.5 text-sm font-semibold text-gray-900">
                {item.sectionRef}: {item.title}
              </h4>
            </div>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Official Source <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">{item.plainLanguageSummary}</p>
          <p className="mt-3 border-t border-gray-100 pt-2.5 text-xs leading-relaxed text-gray-500">
            <span className="font-semibold text-gray-600">Why it matters: </span>
            {item.relevanceReason}
          </p>
        </div>
      ))}
    </div>
  );
}
