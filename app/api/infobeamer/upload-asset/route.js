import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const assetId = formData.get('assetId');

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const mimetype = file.type;

    // Si assetId fourni → remplace l'asset existant
    // Sinon → crée un nouvel asset
    const url = assetId
      ? `https://info-beamer.com/api/v1/asset/${assetId}`
      : 'https://info-beamer.com/api/v1/asset/upload';

    const method = assetId ? 'PUT' : 'POST';

    const form = new global.FormData();
    const blob = new global.Blob([buffer], { type: mimetype });
    form.append('file', blob, filename);

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:' + process.env.INFOBEAMER_API_KEY).toString('base64'),
      },
      body: form,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Upload échoué' }, { status: 400 });
    }

    return NextResponse.json({ success: true, assetId: data.asset_id || data.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}