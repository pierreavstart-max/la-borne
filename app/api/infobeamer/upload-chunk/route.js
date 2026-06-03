import { NextResponse } from 'next/server';
import { writeFileSync, appendFileSync, existsSync } from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const chunk = formData.get('chunk');
    const uploadId = formData.get('uploadId');
    const chunkIndex = parseInt(formData.get('chunkIndex'));
    const totalChunks = parseInt(formData.get('totalChunks'));

    if (!chunk || !uploadId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const tmpPath = `/tmp/upload_${uploadId}.mp4`;
    const buffer = Buffer.from(await chunk.arrayBuffer());

    if (chunkIndex === 0) {
      writeFileSync(tmpPath, buffer);
    } else {
      appendFileSync(tmpPath, buffer);
    }

    console.log(`Chunk ${chunkIndex + 1}/${totalChunks} reçu pour ${uploadId}`);

    return NextResponse.json({ success: true, chunkIndex, totalChunks });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}