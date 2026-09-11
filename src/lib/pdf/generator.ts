/**
 * Server-side PDF generation using @react-pdf/renderer.
 * The disclaimer is always included and cannot be removed.
 */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';
import type { Case } from '@/lib/types';

// Register a safe fallback font (Helvetica is built-in to @react-pdf/renderer)
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#1a1a2e',
    backgroundColor: '#ffffff',
  },
  watermark: {
    position: 'absolute',
    top: 280,
    left: 60,
    fontSize: 60,
    color: '#f0f0f0',
    opacity: 0.4,
    transform: 'rotate(-35deg)',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  docTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    color: '#1a1a2e',
  },
  meta: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  disclaimer: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5',
    marginTop: 16,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
    paddingBottom: 4,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 4,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4f46e5',
    marginTop: 3,
    marginRight: 8,
  },
  timelineContent: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginLeft: 4,
  },
  verificationItem: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  verificationSupported: { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  verificationPartial: { backgroundColor: '#fefce8', borderColor: '#fde047' },
  verificationUnsupported: { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },
  verificationInsufficient: { backgroundColor: '#f9fafb', borderColor: '#d1d5db' },
  legalItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f5f3ff',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#4f46e5',
  },
  draftLetter: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

function statusColor(status: string) {
  switch (status) {
    case 'SUPPORTED': return styles.verificationSupported;
    case 'PARTIALLY_SUPPORTED': return styles.verificationPartial;
    case 'UNSUPPORTED': return styles.verificationUnsupported;
    default: return styles.verificationInsufficient;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'SUPPORTED': return '✓ SUPPORTED';
    case 'PARTIALLY_SUPPORTED': return '~ PARTIALLY SUPPORTED';
    case 'UNSUPPORTED': return '✗ NOT SUPPORTED';
    default: return '? INSUFFICIENT INFORMATION';
  }
}

function ClaraPdf({ caseData }: { caseData: Case }) {
  const packet = caseData.actionPacket;
  const generatedAt = packet
    ? new Date(packet.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return React.createElement(
    Document,
    { title: 'CLARA Action Packet', author: 'CLARA' },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Watermark
      React.createElement(Text, { style: styles.watermark }, 'INFORMATIONAL ONLY'),

      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.appName }, 'CLARA'),
        React.createElement(Text, { style: styles.tagline }, 'Turn complexity into clarity.'),
        React.createElement(Text, { style: styles.docTitle }, 'Tenant Action Packet'),
        React.createElement(
          Text,
          { style: styles.meta },
          `Case ID: ${caseData.id}   |   Generated: ${generatedAt}   |   Location: ${caseData.location}`
        )
      ),

      // Disclaimer — always first, always present
      React.createElement(
        View,
        { style: styles.disclaimer },
        React.createElement(
          Text,
          { style: [styles.disclaimerText, styles.bold] },
          '⚠ IMPORTANT NOTICE'
        ),
        React.createElement(
          Text,
          { style: styles.disclaimerText },
          packet?.disclaimer ?? ''
        )
      ),

      // Case Summary
      React.createElement(Text, { style: styles.sectionTitle }, 'Case Summary'),
      React.createElement(Text, { style: styles.text }, packet?.caseSummary ?? '—'),

      // Applicability
      React.createElement(Text, { style: styles.sectionTitle }, 'Legal Applicability'),
      React.createElement(
        Text,
        { style: styles.text },
        `Status: ${caseData.applicability?.status ?? 'UNCERTAIN'}`
      ),
      ...(caseData.applicability?.reasons ?? []).map((r, i) =>
        React.createElement(Text, { key: i, style: styles.text }, `• ${r}`)
      ),
      ...(caseData.applicability?.limitations ?? []).map((l, i) =>
        React.createElement(Text, { key: `lim-${i}`, style: [styles.text, { color: '#6b7280' }] }, `  ⚠ ${l}`)
      ),

      // Timeline
      React.createElement(Text, { style: styles.sectionTitle }, 'Timeline of Events'),
      ...(packet?.timeline ?? []).map((entry, i) =>
        React.createElement(
          View,
          { key: i, style: styles.timelineItem },
          React.createElement(View, { style: styles.timelineDot }),
          React.createElement(
            View,
            { style: styles.timelineContent },
            React.createElement(
              Text,
              { style: [styles.text, styles.bold] },
              `${entry.dateIsApproximate ? '~' : ''}${entry.date}${entry.dateIsApproximate ? ' (approximate)' : ''}`
            ),
            React.createElement(Text, { style: styles.text }, entry.event),
            React.createElement(
              Text,
              { style: [styles.text, { color: '#6b7280', fontSize: 8 }] },
              `Source: ${entry.source}`
            )
          )
        )
      ),

      // Evidence
      React.createElement(Text, { style: styles.sectionTitle }, 'Evidence'),
      ...(packet?.evidenceSummary ?? []).map((e, i) =>
        React.createElement(Text, { key: i, style: styles.text }, `• ${e}`)
      ),

      // Missing Information
      (packet?.missingInformation ?? []).length > 0
        ? React.createElement(
            React.Fragment,
            {},
            React.createElement(Text, { style: styles.sectionTitle }, 'Missing Information'),
            ...(packet?.missingInformation ?? []).map((m, i) =>
              React.createElement(Text, { key: i, style: styles.text }, `• ${m}`)
            )
          )
        : null,

      // Relevant Legal Information
      React.createElement(Text, { style: styles.sectionTitle }, 'Relevant Legal Information'),
      React.createElement(
        Text,
        { style: [styles.text, { color: '#6b7280', fontSize: 9, marginBottom: 6 }] },
        'The following provisions are sourced from the authoritative legal corpus. They are provided for informational purposes only.'
      ),
      ...(packet?.relevantLegalInfo ?? []).map((item, i) =>
        React.createElement(
          View,
          { key: i, style: styles.legalItem },
          React.createElement(
            Text,
            { style: [styles.text, styles.bold] },
            `${item.actName} — ${item.sectionRef}`
          ),
          React.createElement(Text, { style: styles.text }, item.title),
          React.createElement(Text, { style: styles.text }, item.plainLanguageSummary),
          React.createElement(
            Text,
            { style: [styles.text, { fontSize: 8, color: '#4f46e5' }] },
            `Source: ${item.sourceUrl}`
          )
        )
      ),

      // Verification
      React.createElement(Text, { style: styles.sectionTitle }, 'Verification Results'),
      ...(packet?.verificationSummary ?? []).map((v, i) =>
        React.createElement(
          View,
          { key: i, style: [styles.verificationItem, statusColor(v.status)] },
          React.createElement(
            Text,
            { style: [styles.text, styles.bold] },
            `${statusLabel(v.status)}`
          ),
          React.createElement(Text, { style: styles.text }, `Claim: "${v.claim}"`),
          v.sourceProvisionTitle
            ? React.createElement(
                Text,
                { style: styles.text },
                `Provision: ${v.sourceProvisionTitle}`
              )
            : null,
          React.createElement(
            Text,
            { style: [styles.text, { color: '#374151' }] },
            `Reasoning: ${v.reasoning}`
          ),
          v.missingInformation
            ? React.createElement(
                Text,
                { style: [styles.text, { color: '#6b7280' }] },
                `Missing: ${v.missingInformation}`
              )
            : null
        )
      ),

      // Recommended Next Step
      React.createElement(Text, { style: styles.sectionTitle }, 'Recommended Next Step'),
      React.createElement(
        View,
        { style: { backgroundColor: '#eff6ff', padding: 10, borderRadius: 4, marginTop: 4 } },
        React.createElement(Text, { style: styles.text }, packet?.recommendedNextStep ?? '—')
      ),

      // Draft Repair Request
      React.createElement(Text, { style: styles.sectionTitle }, 'Draft Formal Repair Request'),
      React.createElement(
        Text,
        { style: [styles.text, { color: '#6b7280', fontSize: 9, marginBottom: 6 }] },
        'Review and customise this draft before sending. Replace all [PLACEHOLDER] values with your actual information.'
      ),
      React.createElement(
        View,
        { style: styles.draftLetter },
        React.createElement(Text, { style: styles.text }, packet?.draftRepairRequest ?? '—')
      ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, 'CLARA — Informational Use Only'),
        React.createElement(Text, { style: styles.footerText }, `Generated ${generatedAt}`)
      )
    )
  );
}

export async function generateCasePdf(caseData: Case): Promise<Buffer> {
  const element = React.createElement(ClaraPdf, { caseData });
  return await renderToBuffer(
    element as React.ReactElement<React.ComponentProps<typeof Document>>
  );
}
