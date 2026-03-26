// Node.js script to remove BOM from a JSON file
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'data', 'wearingofthegreen2026-images.json');
let content = fs.readFileSync(filePath);
// Remove BOM if present
if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
  content = content.slice(3);
  fs.writeFileSync(filePath, content);
  console.log('BOM removed from JSON file.');
} else {
  console.log('No BOM found in JSON file.');
}
