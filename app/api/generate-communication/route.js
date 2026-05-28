import { NextResponse } from 'next/server';
import { createCanvas } from 'canvas';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

function generateImage(clientNom, clientSociete, orientation) {
  const canvasW = 1920;
  const canvasH = 1080;
  const canvas = createCanvas(canvasW, canvasH);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2E8FA3';
  ctx.fillRect(0, 0, canvasW, canvasH);

  if (orientation === 'portrait') {
    const boxW = 120;
    const boxH = 900;
    const boxX = canvasW / 2;
    const boxY = canvasH / 2 - boxH / 2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.save();
    ctx.translate(boxX + boxW / 2, canvasH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 90px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BIENVENUE', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(150, canvasH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(clientSociete || clientNom, 0, 0);
    ctx.restore();

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

  return canvas.toBuffer('image/png');
}

async function imageToMp4(pngBuffer, outputPath) {
  const ffmpeg = (await import('fluent-ffmpeg')).default;
  const ffmpegInstaller = (await import('@ffmpeg-installer/ffmpeg')).default;
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  
  const tmpPng = outputPath.replace('.mp4', '_tmp.png');
  writeFileSync(tmpPng, pngBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(tmpPng)
      .inputOptions(['-loop 1'])
      .outputOptions([
        '-c:v libx264',
        '-t 10',
        '-pix_fmt yuv420p',
        '-vf scale=1920:1080',
        '-r 25',
      ])
      .output(outputPath)
      .on('end', () => {
        try { unlinkSync(tmpPng); } catch {}
        resolve();
      })
      .on('error', (err) => {
        try { unlinkSync(tmpPng); } catch {}
        reject(err);
      })
      .run();
  });
}

async function uploadToInfobeamer(buffer, filename, mimetype) {
  const form = new global.FormData();
  const blob = new global.Blob([buffer], { type: mimetype });
  form.append('file', blob, filename);

  const response = await fetch('https://info-beamer.com/api/v1/asset/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('api:' + process.env.INFOBEAMER_API_KEY).toString('base64'),
    },
    body: form,
  });

  return response.json();
}

export async function POST(request) {
  try {
    const { clientNom, clientSociete, orientation, filename, type } = await request.json();
    console.log('=== GENERATE COMMUNICATION ===', { orientation, clientNom, type });

    const pngBuffer = generateImage(clientNom, clientSociete, orientation);
    const isVideo = type?.toLowerCase() === 'vidéo' || type?.toLowerCase() === 'video';

    let ibData;

    if (isVideo) {
      const tmpMp4 = join(process.cwd(), filename + '_tmp.mp4');
      await imageToMp4(pngBuffer, tmpMp4);
      const { readFileSync } = await import('fs');
      const mp4Buffer = readFileSync(tmpMp4);
      try { unlinkSync(tmpMp4); } catch {}
      ibData = await uploadToInfobeamer(mp4Buffer, filename + '.mp4', 'video/mp4');
    } else {
      ibData = await uploadToInfobeamer(pngBuffer, filename + '.png', 'image/png');
    }

    console.log('Info-beamer response:', ibData);

    if (!ibData.ok) {
      return NextResponse.json({ error: ibData.error || 'Upload échoué' }, { status: 400 });
    }

    return NextResponse.json({ success: true, assetId: ibData.asset_id });

  } catch (error) {
    console.error('Erreur generate-communication:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}