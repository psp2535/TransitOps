const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let content = fs.readFileSync(cssPath);

// Detect UTF-16 LE BOM (FF FE)
if (content[0] === 0xFF && content[1] === 0xFE) {
  content = content.toString('utf16le');
} else {
  content = content.toString('utf8');
}

// Strip any remaining BOM character
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

// Ensure tailwind imports are at the top
const tailwindDirectives = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
if (!content.includes('@tailwind base')) {
  content = tailwindDirectives + content;
}

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Fixed index.css encoding and tailwind imports');
