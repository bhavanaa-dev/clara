/**
 * POST /api/cases — Create a new case shell in Firestore
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb, CASES_COLLECTION } from '@/lib/firestore/client';
import type { Case } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userNarrative: string = (body.userNarrative ?? '').trim();

    if (!userNarrative) {
      return NextResponse.json(
        { error: 'userNarrative is required.' },
        { status: 400 }
      );
    }

    if (userNarrative.length > 10000) {
      return NextResponse.json(
        { error: 'userNarrative is too long (max 10,000 characters).' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const newCase: Case = {
      id,
      createdAt: now,
      updatedAt: now,
      status: 'DRAFT',
      userNarrative,
      evidence: [],
      location: 'Bengaluru, Karnataka',
      timeline: [],
      extractedFacts: [],
      missingInformation: [],
      landlordNotified: false,
      verificationResults: [],
    };

    const db = getDb();
    await db.collection(CASES_COLLECTION).doc(id).set(newCase);

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cases] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to create case.' },
      { status: 500 }
    );
  }
}
