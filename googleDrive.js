// Triggering a fresh Vercel build
const { google } = require('googleapis');

// Load Google service account credentials from environment variables
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

/**
 * List image files in a Google Drive folder
 * @param {string} folderId - The ID of the folder to list images from
 * @returns {Promise<Array>} - Array of image file objects
 */
async function listImages(folderId) {
  try {
    let allFiles = [];
    let pageToken = null;
    do {
      const res = await drive.files.list({
        q: `('${folderId}' in parents) and mimeType contains 'image/' and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink)',
        pageToken: pageToken || undefined,
        pageSize: 1000, // max allowed by API
      });
      if (res.data.files && res.data.files.length > 0) {
        allFiles = allFiles.concat(res.data.files);
      }
      pageToken = res.data.nextPageToken;
    } while (pageToken);
    return allFiles.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      url: `https://drive.google.com/uc?id=${file.id}`,
      thumbnailUrl: file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}`,
    }));
  } catch (error) {
    console.error('Google Drive API error:', error);
    if (error && error.response && error.response.data) {
      console.error('Google Drive API error details:', error.response.data);
    }
    if (error && error.stack) {
      console.error('Google Drive API error stack:', error.stack);
    }
    throw error;
  }
}

module.exports = { listImages };