import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  FileCheck,
  BookOpen,
  AlertCircle,
  Scale,
  PenLine,
  ListChecks,
  FileDown,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
              <Scale className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              CLARA
            </span>
          </span>
          <span className="hidden text-xs text-gray-400 sm:block">
            Bengaluru Tenant Assistant · v1
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-medium text-indigo-700">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            Powered by Gemini · Bengaluru residential tenancy
          </div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-balance text-gray-900 sm:text-6xl">
            Turn complexity
            <span className="block text-indigo-600">into clarity.</span>
          </h1>
          <p className="mx-auto mb-9 max-w-xl text-lg leading-relaxed text-gray-600">
            CLARA helps renters in Bengaluru transform a messy housing or repair problem into a
            structured, evidence-backed action packet — grounded in real legislation.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/case/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto"
            >
              Start a case
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto"
            >
              How it works
            </a>
          </div>
          <p className="mt-5 text-sm text-gray-400">
            Free · No account required · Demo use only
          </p>
        </div>
      </section>

      {/* Disclaimer banner */}
      <section className="mx-auto max-w-3xl px-4 pb-10 sm:px-6" aria-label="Important notice">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-amber-800">
            <strong>CLARA is not a lawyer.</strong> It provides informational assistance only and
            is not a substitute for professional legal advice. Always consult a qualified advocate
            before taking legal action.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-16 bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-indigo-600">
            The process
          </p>
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                icon: PenLine,
                title: 'Describe the problem',
                desc: 'Text, voice, photos, screenshots, or your lease — describe what happened in your own words.',
              },
              {
                step: '02',
                icon: ListChecks,
                title: 'Facts extracted',
                desc: 'CLARA uses Gemini to extract only what is explicitly present in your evidence — never invented facts.',
              },
              {
                step: '03',
                icon: Scale,
                title: 'Provisions checked',
                desc: 'Your facts are checked against a curated Karnataka Rent Act corpus — the law is never generated by AI.',
              },
              {
                step: '04',
                icon: FileDown,
                title: 'Action packet',
                desc: 'A structured document with timeline, verified facts, relevant legal info, and a draft repair request — ready to download.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <item.icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold tracking-widest text-indigo-300">{item.step}</span>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Why CLARA
          </p>
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            What you get
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FeatureCard
              icon={<Shield className="h-5 w-5 text-indigo-600" aria-hidden="true" />}
              title="Grounded in real law"
              desc="Legal provisions are sourced from the Karnataka Rent Control Act 1961 and Transfer of Property Act 1882 — never generated from AI memory."
            />
            <FeatureCard
              icon={<FileCheck className="h-5 w-5 text-indigo-600" aria-hidden="true" />}
              title="Verified claims"
              desc="Every extracted fact is verified against authoritative provisions. Results are clearly marked as Verified, Needs Review, or Not Supported."
            />
            <FeatureCard
              icon={<BookOpen className="h-5 w-5 text-indigo-600" aria-hidden="true" />}
              title="Actionable output"
              desc="Download a structured PDF with timeline, evidence list, verification results, and a draft formal repair request — ready for you to review."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-14 text-center sm:px-12">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Ready to start?
            </h2>
            <p className="mx-auto mb-7 max-w-md text-gray-600">
              Describe your situation and let CLARA help you understand it.
            </p>
            <Link
              href="/case/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto"
            >
              Start a case <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-6 text-center sm:px-6">
        <p className="text-xs leading-relaxed text-gray-400">
          CLARA is a hackathon demo. Not legal advice. Informational purposes only. ·{' '}
          Bengaluru, Karnataka residential tenancy · v1
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
        {icon}
      </div>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
    </div>
  );
}
