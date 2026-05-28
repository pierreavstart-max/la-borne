import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://info-beamer.com/api/v1/asset/list', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:' + process.env.INFOBEAMER_API_KEY).toString('base64'),
      },
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}