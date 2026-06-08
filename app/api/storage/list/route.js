import { NextResponse } from 'next/server';
import { adminStorage } from '../../../lib/firebase-admin';

export async function GET() {
  try {
    const bucket = adminStorage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'videos/' });
    const videoFiles = files
      .filter(f => f.name.endsWith('.mp4'))
      .map(f => ({
        name: f.name.replace('videos/', ''),
        url: `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(f.name)}?alt=media`,
      }));
    return NextResponse.json({ files: videoFiles });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}