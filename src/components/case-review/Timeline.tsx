'use client';

import { CalendarClock } from 'lucide-react';
import type { TimelineEntry } from '@/lib/types';

const SOURCE_LABELS: Record<string, string> = {
  TEXT: 'Text',
  IMAGE: 'Image',
  MESSAGE: 'Message',
  USER_STATEMENT: 'User Statement',
  DOCUMENT: 'Document',
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <CalendarClock className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-700">No timeline yet</p>
          <p className="mt-0.5 text-sm text-gray-500">
            No timeline events could be extracted from the provided information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className="relative ml-1 border-l-2 border-indigo-100">
      {entries.map((entry, i) => (
        <li key={entry.id ?? i} className="mb-5 ml-6 last:mb-0">
          <span
            aria-hidden="true"
            className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-gray-50"
          >
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <time className="text-sm font-semibold text-gray-900">
                {entry.dateIsApproximate ? '~ ' : ''}
                {entry.date}
                {entry.dateIsApproximate ? ' (approximate)' : ''}
              </time>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-indigo-700">
                {SOURCE_LABELS[entry.source] ?? entry.source}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">{entry.event}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
