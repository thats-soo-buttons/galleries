import { google } from 'googleapis';
const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};

const auth = new google.auth.GoogleAuth({
  credentials,
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
