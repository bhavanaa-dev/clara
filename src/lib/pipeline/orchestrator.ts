/**
 * Pipeline orchestrator — coordinates all processing steps for a case.
 * Called by the /api/cases/[id]/process API route.
 */
import { extractEvidence } from '@/lib/pipeline/extract';
import { analyseApplicability } from '@/lib/pipeline/applicability';
import { verifyFacts } from '@/lib/pipeline/verify';
import { generateActionPacket } from '@/lib/pipeline/actionPacket';
import { getDb, CASES_COLLECTION } from '@/lib/firestore/client';
import type { Case, EvidenceItem } from '@/lib/types';

export async function runPipeline(caseId: string, caseData: Case): Promise<Case> {
  const db = getDb();
  const caseRef = db.collection(CASES_COLLECTION).doc(caseId);

  // Mark as processing
  await caseRef.update({ status: 'PROCESSING', updatedAt: new Date().toISOString() });

  try {
    // ── Step 1+2: Extract & normalise evidence
    const extraction = await extractEvidence(
      caseData.userNarrative,
      caseData.evidence
    );

    // ── Step 3+4: Applicability analysis (corpus lookup + Gemini reasoning)
    const { applicability, relevantProvisions } = await analyseApplicability(
      extraction.extractedFacts,
      caseData.userNarrative
    );

    // ── Step 5: Verify each extracted fact against corpus provisions
    const verificationResults = await verifyFacts(
      extraction.extractedFacts,
      relevantProvisions
    );

    // ── Step 6: Generate action packet
    const evidenceSummaries = caseData.evidence.map(
      (e) => `${e.type}: ${e.description}`
    );
    const actionPacket = await generateActionPacket(
      extraction.extractedFacts,
      verificationResults,
      relevantProvisions,
      extraction.timeline,
      evidenceSummaries
    );

    // Build updated case — strip contentBase64 before saving to Firestore
    const evidenceForStorage: EvidenceItem[] = caseData.evidence.map((e) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { contentBase64: _dropped, ...rest } = e;
      return rest;
    });

    const updatedCase: Case = {
      ...caseData,
      status: 'READY',
      updatedAt: new Date().toISOString(),
      evidence: evidenceForStorage,
      issueType: extraction.issueType,
      issueTypeLabel: extraction.issueTypeLabel,
      severity: extraction.severity,
      tenantName: extraction.tenantName,
      landlordName: extraction.landlordName,
      propertyAddress: extraction.propertyAddress,
      landlordNotified: extraction.landlordNotified,
      landlordResponse: extraction.landlordResponse,
      timeline: extraction.timeline,
      extractedFacts: extraction.extractedFacts,
      missingInformation: extraction.missingInformation,
      applicability,
      verificationResults,
      actionPacket,
    };

    await caseRef.set(updatedCase);
    return updatedCase;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred during processing.';

    await caseRef.update({
      status: 'ERROR',
      errorMessage,
      updatedAt: new Date().toISOString(),
    });

    throw error;
  }
}
