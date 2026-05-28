import { NextResponse } from 'next/server';
import { createCanvas } from 'canvas';

export async function POST(request) {
  try {
    const { clientNom, clientSociete, orientation, filename } = await request.json();
    console.log('=== GENERATE COMMUNICATION ===', { orientation, clientNom, clientSociete, filename });

    const canvasW = 1920;
    const canvasH = 1080;
    const canvas = createCanvas(canvasW, canvasH);
    const ctx = canvas.getContext('2d');

    // Fond bleu
    ctx.fillStyle = '#2E8FA3';
    ctx.fillRect(0, 0, canvasW, canvasH);

    if (orientation === 'portrait') {
  // Encadré vertical, décalé vers la droite
  const boxW = 120;
  const boxH = 900;
  const boxX = canvasW / 2;
  const boxY = canvasH / 2 - boxH / 2;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // BIENVENUE — tourné 90° antihoraire dans l'encadré (lu de bas en haut)
  ctx.save();
  ctx.translate(boxX + boxW / 2, canvasH / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 90px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BIENVENUE', 0, 0);
  ctx.restore();

  // Nom client — tourné 90° antihoraire, à gauche
  ctx.save();
  ctx.translate(150, canvasH / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(clientSociete || clientNom, 0, 0);
  ctx.restore();

  // URL — tourné 90° antihoraire, tout à gauche
  ctx.save();
  ctx.translate(80, canvasH / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('www.la-borne.fr', 0, 0);
  ctx.restore();

    } else {
      // Paysage — dessin direct 1920x1080

      const boxW = 280;
      const boxH = 600;
      const boxX = canvasW / 2 - boxW / 2;
      const boxY = canvasH / 2 - boxH / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.save();
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BIENVENUE', 0, 0);
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(clientSociete || clientNom, 60, canvasH - 60);

      ctx.font = '28px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('www.la-borne.fr', 60, canvasH - 20);
    }

    const buffer = canvas.toBuffer('image/png');

    // Upload sur info-beamer
    const form = new global.FormData();
    const blob = new global.Blob([buffer], { type: 'image/png' });
    form.append('file', blob, filename + '.png');

    const ibResponse = await fetch('https://info-beamer.com/api/v1/asset/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:' + process.env.INFOBEAMER_API_KEY).toString('base64'),
      },
      body: form,
    });

    const ibData = await ibResponse.json();
    console.log('Info-beamer response:', ibData);

    if (!ibResponse.ok) {
      return NextResponse.json({ error: ibData.error || 'Upload échoué' }, { status: 400 });
    }

    return NextResponse.json({ success: true, assetId: ibData.asset_id });

  } catch (error) {
    console.error('Erreur generate-communication:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}