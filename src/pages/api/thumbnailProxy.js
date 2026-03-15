import { google } from 'googleapis';
import path from 'path';
import sharp from 'sharp';

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(process.cwd(), 'google-service-account.json'),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fileId = req.query.fileId;
  if (!fileId) {
    return res.status(400).json({ error: 'Missing fileId' });
  }

  try {
    // Get file metadata to determine mimeType
    const fileMeta = await drive.files.get({ fileId, fields: 'mimeType, name' });
    const mimeType = fileMeta.data.mimeType;
    const fileName = fileMeta.data.name;

    // Get file content as Buffer
    const driveRes = await drive.files.get({
      fileId,
      alt: 'media',
      responseType: 'arraybuffer',
    });

    // Convert Blob to Buffer if needed
    let imageBuffer;
    if (driveRes.data instanceof Buffer) {
      imageBuffer = driveRes.data;
    } else if (driveRes.data instanceof ArrayBuffer) {
      imageBuffer = Buffer.from(driveRes.data);
    } else if (typeof driveRes.data === 'object' && typeof driveRes.data.arrayBuffer === 'function') {
      // It's a Blob
      const arrayBuffer = await driveRes.data.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error('Unsupported image data type for thumbnail generation');
    }

    try {
      const thumbBuffer = await sharp(imageBuffer).resize({ width: 300 }).jpeg().toBuffer();
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `inline; filename="thumb_${fileName}"`);
      res.send(thumbBuffer);
    } catch (err) {
      console.error('Sharp transform error:', err);
      res.status(500).json({ error: 'Sharp transform error', details: err.message });
    }
  } catch (error) {
    console.error('thumbnailProxy error:', error);
    res.status(500).json({ error: 'Failed to proxy thumbnail', details: error.message });
  }
}
