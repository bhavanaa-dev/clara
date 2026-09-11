export default function CaseLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-gray-700">Loading case…</p>
        <p className="mt-1 text-xs text-gray-400">CLARA is retrieving your case details</p>
      </div>
    </div>
  );
}
