import { cn } from '@/lib/utils';
import type { VerificationStatus, ApplicabilityStatus } from '@/lib/types';

type StatusType = VerificationStatus | ApplicabilityStatus | 'READY' | 'PROCESSING' | 'ERROR' | 'DRAFT';

const CONFIG: Record<string, { label: string; className: string }> = {
  SUPPORTED: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PARTIALLY_SUPPORTED: {
    label: 'Needs Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  UNSUPPORTED: {
    label: 'Not Supported',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  INSUFFICIENT_INFORMATION: {
    label: 'Insufficient Info',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
  },
  APPLICABLE: {
    label: 'Applicable',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  UNCERTAIN: {
    label: 'Applicability Uncertain',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  NOT_APPLICABLE: {
    label: 'Not Applicable',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  READY: {
    label: 'Ready',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PROCESSING: {
    label: 'Processing…',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  ERROR: {
    label: 'Error',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  DRAFT: {
    label: 'Draft',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = CONFIG[status] ?? { label: status, className: 'bg-gray-50 text-gray-600 border-gray-200' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        config.className,
        className
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
