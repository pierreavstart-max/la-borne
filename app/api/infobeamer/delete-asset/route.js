import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { assetId } = body;

    const response = await fetch(`https://info-beamer.com/api/v1/asset/${assetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:' + process.env.INFOBEAMER_API_KEY).toString('base64'),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Suppression échouée' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}