import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone', // Needed for Docker / Cloud Run deployment

  // Prevent server-only modules from being bundled into the client
  serverExternalPackages: ['firebase-admin', '@google/genai', '@react-pdf/renderer'],

  // Security: don't expose internal server errors to the client
  poweredByHeader: false,
};

export default nextConfig;
