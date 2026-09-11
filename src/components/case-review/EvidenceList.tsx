'use client';

import type { EvidenceItem } from '@/lib/types';
import { FileImage, FileText, MessageSquare, File, FolderOpen } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  IMAGE: FileImage,
  MESSAGE: MessageSquare,
  DOCUMENT: FileText,
  TEXT: FileText,
  USER_STATEMENT: FileText,
};

export function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) {
    return (
      <div className="flex gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <FolderOpen className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-700">No evidence attached</p>
          <p className="mt-0.5 text-sm text-gray-500">
            No evidence files were uploaded. Adding photos, screenshots, or documents strengthens your case.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {evidence.map((item) => {
        const Icon = ICON_MAP[item.type] ?? File;
        return (
          <li
            key={item.id}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {item.fileName ?? item.description}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {item.type} {item.mimeType ? `· ${item.mimeType}` : ''} · Uploaded{' '}
                {new Date(item.uploadedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
