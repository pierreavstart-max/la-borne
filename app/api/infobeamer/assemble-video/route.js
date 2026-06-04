import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();

    const railwayRes = await fetch('https://la-borne-ffmpeg-production.up.railway.app/assemble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        ibApiKey: process.env.INFOBEAMER_API_KEY,
      }),
    });

    const data = await railwayRes.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}