import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const orientation = formData.get('orientation');
    const filename = formData.get('filename');

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let uploadBuffer = buffer;

    if (orientation === 'portrait' && file.type.startsWith('image/')) {
      // L'image est en 1080x1920 (portrait)
      // On la pivote 90° sens horaire pour obtenir 1920x1080
      const img = await loadImage(buffer);
      
      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext('2d');

      ctx.save();
      ctx.translate(1920, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, 0, 0, 1080, 1920);
      ctx.restore();

      uploadBuffer = canvas.toBuffer('image/png');
    }

    const uploadFilename = filename || file.name;
    const form = new global.FormData();
    const blob = new global.Blob([uploadBuffer], { type: 'image/png' });
    form.append('file', blob, uploadFilename);

    const response = await fetch('https://info-beamer.com/api/v1/asset/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:' + process.env.INFOBEAMER_API_KEY).toString('base64'),
      },
      body: form,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Upload échoué' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      assetId: data.asset_id,
      thumb: data.info?.thumb || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}