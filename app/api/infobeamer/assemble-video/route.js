export const maxDuration = 60;
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};
import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';

export async function POST(request) {
  const tmpBg = `/tmp/bg_${Date.now()}.png`;
  const tmpVideo = `/tmp/video_${Date.now()}.mp4`;
  const tmpOut = `/tmp/out_${Date.now()}.mp4`;

  try {
    const formData = await request.formData();
    const videoFile = formData.get('video');
    const bgFile = formData.get('background');
    const videoX = parseInt(formData.get('videoX'));
    const videoY = parseInt(formData.get('videoY'));
    const videoW = parseInt(formData.get('videoW'));
    const videoH = parseInt(formData.get('videoH'));
    const orientation = formData.get('orientation');
    const filename = formData.get('filename');

    // Sauvegarde les fichiers temporaires
    const videoBuf = Buffer.from(await videoFile.arrayBuffer());
    const bgBuf = Buffer.from(await bgFile.arrayBuffer());
    writeFileSync(tmpVideo, videoBuf);

    // Pour portrait : pivote le fond 90° sens horaire
    if (orientation === 'portrait') {
      const img = await loadImage(bgBuf);
      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.translate(1920, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, 0, 0, 1080, 1920);
      ctx.restore();
      writeFileSync(tmpBg, canvas.toBuffer('image/png'));
    } else {
      writeFileSync(tmpBg, bgBuf);
    }

    // Calcule les coordonnées finales selon orientation
    let finalX = videoX;
    let finalY = videoY;
    let finalW = videoW;
    let finalH = videoH;

    if (orientation === 'portrait') {
      // Transformation des coordonnées portrait→paysage (rotation 90° horaire)
      // Dans le canvas portrait (1080x1920) : (x, y, w, h)
      // Dans le canvas paysage (1920x1080) après rotation :
      finalX = 1920 - videoY - videoH;
      finalY = videoX;
      finalW = videoH;
      finalH = videoW;
    }

    // Assemble avec ffmpeg
    const ffmpeg = (await import('fluent-ffmpeg')).default;
    const ffmpegInstaller = (await import('@ffmpeg-installer/ffmpeg')).default;
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(tmpBg)
        .inputOptions(['-loop 1'])
        .input(tmpVideo)
        .complexFilter([
          // Redimensionne la vidéo à la taille de la zone
          `[1:v]scale=${finalW}:${finalH}[scaled]`,
          // Superpose la vidéo sur le fond à la bonne position
          `[0:v][scaled]overlay=${finalX}:${finalY}[out]`,
        ])
        .outputOptions([
          '-map [out]',
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-r 25',
          '-shortest',
        ])
        .output(tmpOut)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Upload sur info-beamer
    const mp4Buffer = readFileSync(tmpOut);
    const form = new global.FormData();
    const blob = new global.Blob([mp4Buffer], { type: 'video/mp4' });
    form.append('file', blob, filename);

    const response = await fetch('https://info-beamer.com/api/v1/asset/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:' + process.env.INFOBEAMER_API_KEY).toString('base64'),
      },
      body: form,
    });

    const data = await response.json();

    // Nettoyage
    try { unlinkSync(tmpBg); } catch {}
    try { unlinkSync(tmpVideo); } catch {}
    try { unlinkSync(tmpOut); } catch {}

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Upload échoué' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      assetId: data.asset_id,
      thumb: data.info?.thumb || null,
    });

  } catch (error) {
    try { unlinkSync(tmpBg); } catch {}
    try { unlinkSync(tmpVideo); } catch {}
    try { unlinkSync(tmpOut); } catch {}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}