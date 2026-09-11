'use client';

import { useState } from 'react';
import {
  Download,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Compass,
  FileText,
  ListChecks,
} from 'lucide-react';
import type { ActionPacket as ActionPacketType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActionPacketProps {
  packet: ActionPacketType;
  caseId: string;
}

export function ActionPacket({ packet, caseId }: ActionPacketProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/pdf`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'PDF generation failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clara-action-packet-${caseId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyLetter() {
    if (!packet.draftRepairRequest) return;
    await navigator.clipboard.writeText(packet.draftRepairRequest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer — always first, always prominent */}
      <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div>
          <p className="mb-1 text-sm font-semibold text-amber-900">Important Notice</p>
          <p className="text-xs leading-relaxed text-amber-800">{packet.disclaimer}</p>
        </div>
      </div>

      {/* Download PDF */}
      <div className="flex flex-col gap-4 rounded-2xl border border-indigo-600 bg-indigo-600 p-5 shadow-md shadow-indigo-600/25 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:flex" aria-hidden="true">
            <Download className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="text-base font-bold text-white">Your Action Packet is ready</p>
            <p className="mt-0.5 text-sm leading-relaxed text-indigo-100">
              Full PDF with timeline, verification, legal info, and draft letter
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition-all hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600 disabled:translate-y-0 disabled:opacity-70 sm:w-auto"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          {downloading ? 'Generating…' : 'Download PDF'}
        </button>
      </div>

      {downloadError && (
        <p role="alert" className="flex items-center gap-2 text-sm font-medium text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {downloadError}
        </p>
      )}

      {/* Recommended next step */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-900">
          <Compass className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          Recommended Next Step
        </h3>
        <p className="text-sm leading-relaxed text-indigo-800">{packet.recommendedNextStep}</p>
      </div>

      {/* Missing information */}
      {packet.missingInformation.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <ListChecks className="h-4 w-4 text-amber-700" aria-hidden="true" />
            Strengthen Your Case
          </h3>
          <p className="mb-2.5 text-xs leading-relaxed text-amber-700">The following information would improve your case:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            {packet.missingInformation.map((m, i) => (
              <li key={i} className="text-sm leading-relaxed text-amber-800">{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Draft repair request */}
      {packet.draftRepairRequest && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FileText className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                Draft Formal Repair Request
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Review carefully. Replace all [PLACEHOLDER] values before sending.
              </p>
            </div>
            <button
              onClick={handleCopyLetter}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-sans text-sm leading-relaxed text-gray-800">
            {packet.draftRepairRequest}
          </pre>
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
            <span>
              <strong>Human review required.</strong> Do NOT send this letter without reading it
              carefully. CLARA does not automatically send emails, messages, or legal notices.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
