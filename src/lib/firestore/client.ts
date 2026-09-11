/**
 * Firestore client — Firebase Admin SDK, server-side only.
 * Never import this from client-side code.
 *
 * Credentials are read from environment variables:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;
let _db: Firestore | null = null;

function initFirebase(): App {
  if (_app) return _app;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    _app = existingApps[0];
    return _app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file.'
    );
  }

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  return _app;
}

export function getDb(): Firestore {
  if (_db) return _db;
  initFirebase();
  _db = getFirestore();
  return _db;
}

export const CASES_COLLECTION = 'cases';
