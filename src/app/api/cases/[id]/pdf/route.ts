/**
 * POST /api/cases/[id]/pdf — Generate and stream the action packet PDF
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDb, CASES_COLLECTION } from '@/lib/firestore/client';
import { generateCasePdf } from '@/lib/pdf/generator';
import type { Case } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
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

    if (caseData.status !== 'READY') {
      return NextResponse.json(
        { error: 'Case is not ready for PDF generation.' },
        { status: 409 }
      );
    }

    const pdfBuffer = await generateCasePdf(caseData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="clara-action-packet-${id.slice(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[POST /api/cases/[id]/pdf] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'PDF generation failed.' }, { status: 500 });
  }
}
