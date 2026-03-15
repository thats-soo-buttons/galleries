const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(process.cwd(), 'google-service-account.json'), // Use project root for absolute path
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * List image files in a Google Drive folder
 * @param {string} folderId - The ID of the folder to list images from
 * @returns {Promise<Array>} - Array of image file objects
 */
async function listImages(folderId) {
  try {
    const res = await drive.files.list({
      q: `('${folderId}' in parents) and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink)',
    });
    return res.data.files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      url: `https://drive.google.com/uc?id=${file.id}`,
      thumbnailUrl: file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}`,
    }));
  } catch (error) {
    console.error('Google Drive API error:', error);
    throw error;
  }
}

module.exports = { listImages };