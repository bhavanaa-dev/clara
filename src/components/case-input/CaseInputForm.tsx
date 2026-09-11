'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { FileUploader } from './FileUploader';

const DEMO_EXAMPLE =
  `My ceiling has been leaking for three weeks. I told my landlord twice on WhatsApp — once on August 20th and again on August 27th — and he said he'd send someone, but nobody came. The leak is getting worse and there's now water damage on the wall. I'm renting a 2BHK flat in Koramangala, Bengaluru.`;

export function CaseInputForm() {
  const router = useRouter();
  const [narrative, setNarrative] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleVoiceTranscript(text: string) {
    setNarrative((prev) => (prev ? `${prev} ${text}` : text));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = narrative.trim();
    if (!trimmed) {
      setError('Please describe what happened before submitting.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // Step 1: Create case
      const createRes = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNarrative: trimmed }),
      });
      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error ?? 'Failed to create case');
      }
      const { id } = await createRes.json();

      // Step 2: Process (with files)
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const processRes = await fetch(`/api/cases/${id}/process`, {
        method: 'POST',
        body: formData,
      });
      if (!processRes.ok) {
        const data = await processRes.json();
        throw new Error(data.error ?? 'Processing failed');
      }

      // Redirect to case review
      router.push(`/case/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Main narrative */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Step 1 · Describe
        </p>
        <label
          htmlFor="narrative"
          className="mb-2 block text-sm font-semibold text-gray-900"
        >
          Tell us what happened
        </label>
        <p className="mb-3 text-sm leading-relaxed text-gray-500">
          Describe the issue in your own words. Include relevant dates, what you told your
          landlord, and what response you received. Be as specific as possible.
        </p>
        <textarea
          id="narrative"
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          disabled={submitting}
          rows={7}
          placeholder="e.g. My ceiling has been leaking for three weeks. I notified my landlord twice…"
          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-50 disabled:opacity-60"
          aria-describedby="narrative-hint"
        />
        <p id="narrative-hint" className="mt-1.5 text-right text-xs tabular-nums text-gray-400">
          {narrative.length.toLocaleString('en-IN')} / 10,000 characters
        </p>
      </div>

      {/* Voice input */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Prefer speaking?
        </p>
        <p className="mb-3 text-sm font-medium text-gray-700">Dictate your description</p>
        <VoiceInput onTranscript={handleVoiceTranscript} disabled={submitting} />
      </div>

      {/* File upload */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Step 2 · Evidence
        </p>
        <p className="mb-2 text-sm font-semibold text-gray-900">
          Attach evidence{' '}
          <span className="font-normal text-gray-500">(optional but recommended)</span>
        </p>
        <p className="mb-3 text-sm leading-relaxed text-gray-500">
          Photos of damage, screenshots of WhatsApp messages, your lease agreement, or any other
          relevant documents.
        </p>
        <FileUploader files={files} onChange={setFiles} disabled={submitting} />
      </div>

      {/* Try demo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setNarrative(DEMO_EXAMPLE)}
          disabled={submitting}
          className="text-xs text-indigo-600 underline-offset-2 hover:underline disabled:opacity-50"
        >
          Use demo example
        </button>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">Bengaluru residential tenancy only (v1)</span>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-700 shadow-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Submit */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Step 3 · Analyse
        </p>
        <button
          type="submit"
          disabled={submitting || !narrative.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Analysing your case…
            </>
          ) : (
            'Analyse my case'
          )}
        </button>
      </div>

      {submitting && (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"
        >
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-indigo-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-indigo-900">Analysing your case…</p>
            <p className="mt-0.5 text-xs leading-relaxed text-indigo-700">
              CLARA is extracting facts, checking legal provisions, and building your action
              packet. This takes 20–40 seconds — please keep this page open.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
