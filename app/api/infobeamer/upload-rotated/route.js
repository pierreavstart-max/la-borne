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
    let uploadMimetype = 'image/png';

    if (orientation === 'portrait' && file.type.startsWith('image/')) {
      // Charge l'image et la pivote 90° sens horaire
      const img = await loadImage(buffer);
      const srcW = img.width;
      const srcH = img.height;

      // Canvas final 1920x1080
      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext('2d');

      // Pivot 90° sens horaire
      ctx.translate(1920, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, 0, 0, srcW, srcH, 0, 0, srcH, srcW);

      uploadBuffer = canvas.toBuffer('image/png');
    }

    // Upload sur info-beamer avec le nom original
    const uploadFilename = filename || file.name;
    const form = new global.FormData();
    const blob = new global.Blob([uploadBuffer], { type: uploadMimetype });
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