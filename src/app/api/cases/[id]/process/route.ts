/**
 * POST /api/cases/[id]/process
 * Accepts multipart form-data with evidence files, runs the full pipeline.
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb, CASES_COLLECTION } from '@/lib/firestore/client';
import { runPipeline } from '@/lib/pipeline/orchestrator';
import {
  validateMimeType,
  validateFileSize,
  validateFileCount,
} from '@/lib/security/fileValidator';
import type { Case, EvidenceItem, EvidenceMimeType } from '@/lib/types';

export const runtime = 'nodejs';
// Allow up to 30 MB for the whole request (multiple files)
export const maxDuration = 120;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const doc = await db.collection(CASES_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 });
    }

    const caseData = doc.data() as Case;

    if (caseData.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Case is already being processed.' },
        { status: 409 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // Validate file count
    const countResult = validateFileCount(files.length);
    if (!countResult.valid) {
      return NextResponse.json({ error: countResult.error }, { status: 400 });
    }

    // Validate and convert each file to EvidenceItem
    const evidenceItems: EvidenceItem[] = [];
    for (const file of files) {
      const mimeResult = validateMimeType(file.type);
      if (!mimeResult.valid) {
        return NextResponse.json({ error: mimeResult.error }, { status: 400 });
      }

      const sizeResult = validateFileSize(file.size);
      if (!sizeResult.valid) {
        return NextResponse.json({ error: sizeResult.error }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      const source = file.type.startsWith('image/')
        ? 'IMAGE'
        : file.type === 'application/pdf'
          ? 'DOCUMENT'
          : 'MESSAGE';

      evidenceItems.push({
        id: uuidv4(),
        type: source,
        fileName: file.name,
        mimeType: file.type as EvidenceMimeType,
        uploadedAt: new Date().toISOString(),
        description: file.name,
        contentBase64: base64,
      });
    }

    // Update case with evidence items (including base64 for pipeline use)
    const caseWithEvidence: Case = {
      ...caseData,
      evidence: evidenceItems,
    };

    // Run pipeline (async — this persists the result to Firestore)
    const processedCase = await runPipeline(id, caseWithEvidence);

    // Strip contentBase64 from response
    const safeCase = {
      ...processedCase,
      evidence: processedCase.evidence.map((e) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { contentBase64: _dropped, ...rest } = e;
        return rest;
      }),
    };

    return NextResponse.json({ case: safeCase });
  } catch (error) {
    console.error(
      '[POST /api/cases/[id]/process] Error:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: 'Processing failed. Please try again.' },
      { status: 500 }
    );
  }
}
