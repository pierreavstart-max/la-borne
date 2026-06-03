import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ token: process.env.INFOBEAMER_API_KEY });
}