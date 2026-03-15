import { listImages } from '../../../googleDrive';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support folderId from body (POST) or query (GET)
  const folderId = req.method === 'POST' ? req.body.folderId : req.query.folderId;
  if (!folderId) {
    return res.status(400).json({ error: 'Missing folderId' });
  }

  try {
    const images = await listImages(folderId);
    return res.status(200).json({ images });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch images', details: error.message });
  }
}
