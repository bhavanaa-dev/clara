import { CaseInputForm } from '@/components/case-input/CaseInputForm';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Start a case — CLARA',
};

const STEPS = [
  { n: '1', label: 'Describe', current: true },
  { n: '2', label: 'Review analysis', current: false },
  { n: '3', label: 'Action packet', current: false },
];

export default function NewCasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded text-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
              <Scale className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900">CLARA</span>
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Start a case</h1>
          <p className="mt-2 leading-relaxed text-gray-600">
            Tell CLARA what happened. The more detail you provide, the more thorough the analysis.
          </p>
        </div>

        {/* Progress steps */}
        <ol className="mb-6 flex items-center gap-2" aria-label="Case progress">
          {STEPS.map((step, i) => (
            <li key={step.n} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                aria-current={step.current ? 'step' : undefined}
                className={
                  step.current
                    ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm'
                    : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-400'
                }
              >
                {step.n}
              </span>
              <span
                className={
                  step.current
                    ? 'hidden text-xs font-semibold text-gray-900 sm:block'
                    : 'hidden text-xs text-gray-400 sm:block'
                }
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="mx-1 h-px flex-1 bg-gray-200" />
              )}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <CaseInputForm />
        </div>

        <div className="mt-6 flex gap-3 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" aria-hidden="true" />
          </span>
          <div>
            <p className="mb-0.5 text-sm font-semibold text-gray-900">Your privacy matters</p>
            <p className="text-xs leading-relaxed text-gray-500">
              <strong>Privacy note:</strong> For this hackathon demo, do not submit real personal
              information. Use synthetic or demo data only. Uploaded evidence is processed by Gemini
              and stored for the duration of your session. It is not shared with third parties.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
