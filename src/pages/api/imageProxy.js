import { google } from 'googleapis';
import path from 'path';

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

    // Get file content
    const driveRes = await drive.files.get({
      fileId,
      alt: 'media',
      responseType: 'stream',
    });

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    driveRes.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to proxy image', details: error.message });
  }
}
