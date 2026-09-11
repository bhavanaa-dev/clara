/**
 * GET /api/cases/[id] — Retrieve a case from Firestore
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDb, CASES_COLLECTION } from '@/lib/firestore/client';
import type { Case, EvidenceItem } from '@/lib/types';

export async function GET(
  _request: NextRequest,
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

    // Strip contentBase64 before sending to client
    const safeCase = {
      ...caseData,
      evidence: caseData.evidence.map((e: EvidenceItem) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { contentBase64: _dropped, ...rest } = e;
        return rest;
      }),
    };

    return NextResponse.json(safeCase);
  } catch (error) {
    console.error('[GET /api/cases/[id]] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to retrieve case.' }, { status: 500 });
  }
}
