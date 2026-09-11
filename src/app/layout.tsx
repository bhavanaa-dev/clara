import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CLARA — Turn complexity into clarity.',
  description:
    'CLARA helps Bengaluru renters turn housing and repair problems into structured, evidence-backed action packets. Informational assistance only — not legal advice.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
