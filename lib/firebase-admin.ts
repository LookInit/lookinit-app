import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { CONFIG } from './config';

let firebaseApp: any = null;

export async function getAdminApp() {
  if (firebaseApp) return firebaseApp;

  if (getApps().length === 0) {
    try {
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (!clientEmail || !privateKey) {
        throw new Error('FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set');
      }

      firebaseApp = initializeApp({
        credential: cert({
          projectId: CONFIG.firebase.projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw error;
    }
  } else {
    firebaseApp = getApps()[0];
  }

  return firebaseApp;
}

export async function getAdminDb() {
  const app = await getAdminApp();
  return getFirestore(app);
}

export async function getAdminAuth() {
  const app = await getAdminApp();
  return getAuth(app);
}
