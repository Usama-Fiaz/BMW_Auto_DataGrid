const admin = require('firebase-admin');

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

console.log('🔥 Firebase Config: Initializing Firebase Admin...');
console.log('🔥 Firebase Config: Project ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
console.log('🔥 Firebase Config: Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing');
console.log('🔥 Firebase Config: Private Key:', firebasePrivateKey ? 'Set' : 'Missing');

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: firebasePrivateKey,
    }),
  });
  console.log('✅ Firebase Config: Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Config: Failed to initialize Firebase Admin:', error);
  throw error;
}