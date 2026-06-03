import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';

export const maxDuration = 60;

export async function POST(request) {
  const tmpBg = `/tmp/bg_${Date.now()}.png`;
  const tmpVideoIn = `/tmp/vin_${Date.now()}.mp4`;
  const tmpOut = `/tmp/out_${Date.now()}.mp4`;

  try {
    const body = await request.json();
    const { bgBase64, videoURL, videoX, videoY, videoW, videoH, orientation, filename } = body;

    console.log('assemble-video called:', { videoURL, videoX, videoY, videoW, videoH, orientation });

    // Télécharge la vidéo depuis Firebase Storage
    const videoRes = await fetch(videoURL);
    if (!videoRes.ok) {
      return NextResponse.json({ error: 'Impossible de télécharger la vidéo depuis Firebase' }, { status: 400 });
    }
    const videoBuf = Buffer.from(await videoRes.arrayBuffer());
    writeFileSync(tmpVideoIn, videoBuf);
    console.log('Video downloaded, size:', videoBuf.length);

    // Décode le fond PNG
    const bgBuf = Buffer.from(bgBase64, 'base64');

    if (orientation === 'portrait') {
      const img = await loadImage(bgBuf);
      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext('2d');
      ctx.translate(1920, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, 0, 0, 1080, 1920);
      writeFileSync(tmpBg, canvas.toBuffer('image/png'));
    } else {
      writeFileSync(tmpBg, bgBuf);
    }

    let finalX = videoX;
    let finalY = videoY;
    let finalW = videoW;
    let finalH = videoH;

    if (orientation === 'portrait') {
      finalX = 1920 - videoY - videoH;
      finalY = videoX;
      finalW = videoH;
      finalH = videoW;
    }

    console.log('Final coords:', { finalX, finalY, finalW, finalH });

    const ffmpeg = (await import('fluent-ffmpeg')).default;
    const ffmpegInstaller = (await import('@ffmpeg-installer/ffmpeg')).default;
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(tmpBg)
        .inputOptions(['-loop 1'])
        .input(tmpVideoIn)
        .complexFilter([
          `[1:v]scale=${finalW}:${finalH}[scaled]`,
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
        .on('end', () => { console.log('ffmpeg done'); resolve(); })
        .on('error', (err) => { console.log('ffmpeg error:', err.message); reject(err); })
        .run();
    });

    const mp4Buffer = readFileSync(tmpOut);
    console.log('Output size:', mp4Buffer.length);

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

    try { unlinkSync(tmpBg); } catch {}
    try { unlinkSync(tmpVideoIn); } catch {}
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
    console.error('assemble-video error:', error);
    try { unlinkSync(tmpBg); } catch {}
    try { unlinkSync(tmpVideoIn); } catch {}
    try { unlinkSync(tmpOut); } catch {}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}