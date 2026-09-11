// ─── Evidence & Source ───────────────────────────────────────────────────────

export type EvidenceSource =
  | 'TEXT'
  | 'IMAGE'
  | 'MESSAGE'
  | 'USER_STATEMENT'
  | 'DOCUMENT';

export type EvidenceMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'application/pdf'
  | 'text/plain';

export interface EvidenceItem {
  id: string;
  type: EvidenceSource;
  fileName?: string;
  mimeType?: EvidenceMimeType;
  uploadedAt: string; // ISO-8601
  description: string;
  /** Base64-encoded content — stored server-side only, never sent to client in list views */
  contentBase64?: string;
}

// ─── Extracted Facts ─────────────────────────────────────────────────────────

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ExtractedFact {
  id: string;
  claim: string;
  source: EvidenceSource;
  evidenceId?: string; // links back to EvidenceItem.id
  confidence: ConfidenceLevel;
  isAmbiguous: boolean;
  ambiguityNote?: string;
}

export interface TimelineEntry {
  id: string;
  /** ISO-8601 date string, or a human-readable approximate like "approximately March 2024" */
  date: string;
  dateIsApproximate: boolean;
  event: string;
  source: EvidenceSource;
  evidenceId?: string;
}

// ─── Applicability ───────────────────────────────────────────────────────────

export type ApplicabilityStatus =
  | 'APPLICABLE'
  | 'UNCERTAIN'
  | 'NOT_APPLICABLE';

export interface ApplicabilityResult {
  status: ApplicabilityStatus;
  reasons: string[];
  limitations: string[];
  /** The corpus sections that were checked */
  checkedProvisions: string[];
}

// ─── Verification ────────────────────────────────────────────────────────────

export type VerificationStatus =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'UNSUPPORTED'
  | 'INSUFFICIENT_INFORMATION';

export interface VerificationResult {
  id: string;
  claimId: string; // links to ExtractedFact.id
  claim: string; // denormalised for display
  status: VerificationStatus;
  /** Verbatim from the trusted corpus — never LLM-generated */
  sourceProvisionId?: string;
  sourceProvisionTitle?: string;
  sourceText?: string;
  sourceUrl?: string;
  reasoning: string;
  confidence: ConfidenceLevel;
  missingInformation?: string;
  applicabilityStatus: ApplicabilityStatus;
}

// ─── Legal Info (from corpus) ─────────────────────────────────────────────────

export interface LegalInfoItem {
  provisionId: string;
  actName: string;
  sectionRef: string;
  title: string;
  plainLanguageSummary: string;
  sourceUrl: string;
  relevanceReason: string;
}

// ─── Action Packet ────────────────────────────────────────────────────────────

export interface ActionPacket {
  generatedAt: string; // ISO-8601
  caseSummary: string;
  timeline: TimelineEntry[];
  evidenceSummary: string[];
  relevantLegalInfo: LegalInfoItem[];
  verificationSummary: VerificationResult[];
  missingInformation: string[];
  recommendedNextStep: string;
  draftRepairRequest: string;
  /** Injected by code, never by the LLM */
  disclaimer: string;
}

// ─── Case ────────────────────────────────────────────────────────────────────

export type CaseStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'ERROR';

export type IssueType =
  | 'REPAIR_HABITABILITY'
  | 'WATER_SUPPLY'
  | 'ELECTRICAL'
  | 'STRUCTURAL'
  | 'PEST_INFESTATION'
  | 'SECURITY'
  | 'COMMON_AREAS'
  | 'OTHER';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Case {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  errorMessage?: string;

  // ── Raw input
  userNarrative: string;
  evidence: EvidenceItem[];

  // ── Extracted structure
  issueType?: IssueType;
  issueTypeLabel?: string;
  severity?: Severity;
  location: string; // "Bengaluru, Karnataka" for v1
  timeline: TimelineEntry[];
  extractedFacts: ExtractedFact[];
  missingInformation: string[];

  // ── Parties
  tenantName?: string;
  landlordName?: string;
  propertyAddress?: string;

  // ── Landlord notification
  landlordNotified: boolean;
  landlordResponse?: string;

  // ── Applicability
  applicability?: ApplicabilityResult;

  // ── Verification
  verificationResults: VerificationResult[];

  // ── Action packet
  actionPacket?: ActionPacket;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface CreateCaseRequest {
  userNarrative: string;
}

export interface CreateCaseResponse {
  id: string;
}

export interface ProcessCaseResponse {
  case: Omit<Case, 'evidence'> & { evidence: Omit<EvidenceItem, 'contentBase64'>[] };
}

export interface ApiError {
  error: string;
  code?: string;
}

// ─── Corpus types ─────────────────────────────────────────────────────────────

export interface CorpusProvision {
  id: string;
  actName: string;
  sectionRef: string;
  title: string;
  /** Exact text from the authoritative source */
  exactSourceText: string;
  officialSourceUrl: string;
  topic: string;
  category: CorpusCategory;
  applicabilityConditions: string[];
  limitations: string[];
  /** Safe plain-language explanation — clearly marked as explanatory, not authoritative */
  plainLanguageSummary: string;
  keywords: string[];
}

export type CorpusCategory =
  | 'REPAIR_OBLIGATION'
  | 'HABITABILITY'
  | 'NOTICE_REQUIREMENT'
  | 'TENANT_RIGHTS'
  | 'LANDLORD_DUTIES'
  | 'RENT_CONTROL'
  | 'GENERAL';
