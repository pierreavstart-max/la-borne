import { NextResponse } from 'next/server';

async function getAdmin() {
  const { default: admin } = await import('firebase-admin');
  if (admin.apps.length) return admin;
  
  let credential;
  try {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const serviceAccount = JSON.parse(
      readFileSync(join(process.cwd(), 'firebase-admin.json'), 'utf8')
    );
    credential = admin.credential.cert(serviceAccount);
  } catch {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    });
  }
  admin.initializeApp({ credential });
  return admin;
}

export async function POST(request) {
  try {
    const admin = await getAdmin();
    const { email, password } = await request.json();
    const user = await admin.auth().createUser({ email, password });
    return NextResponse.json({ uid: user.uid });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}