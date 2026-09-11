'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
];
const MAX_SIZE_MB = 10;
const MAX_FILES = 5;

interface FileItem {
  file: File;
  id: string;
  error?: string;
}

interface FileUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

function fileIcon(type: string) {
  if (type.startsWith('image/')) return FileImage;
  if (type === 'application/pdf' || type === 'text/plain') return FileText;
  return File;
}

export function FileUploader({ files, onChange, disabled }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const valid: File[] = [];
      for (const f of incoming) {
        if (!ALLOWED_TYPES.includes(f.type)) continue;
        if (f.size > MAX_SIZE_MB * 1024 * 1024) continue;
        valid.push(f);
      }
      const merged = [...files, ...valid].slice(0, MAX_FILES);
      onChange(merged);
    },
    [files, onChange]
  );

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onChange(next);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8',
          dragOver
            ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-4 ring-indigo-100'
            : 'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-sm',
          disabled && 'pointer-events-none opacity-50'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <span
          className={cn(
            'mb-3 flex h-11 w-11 items-center justify-center rounded-full transition-colors',
            dragOver ? 'bg-indigo-600' : 'bg-indigo-100'
          )}
        >
          <Upload className={cn('h-5 w-5', dragOver ? 'text-white' : 'text-indigo-600')} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-gray-800">
          {dragOver ? 'Drop files to attach' : 'Drop files here or browse'}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Photos, screenshots, PDFs, text files · Max {MAX_SIZE_MB} MB each · Up to {MAX_FILES} files
        </p>
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
        />
      </label>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => {
            const Icon = fileIcon(file.type);
            return (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{file.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
