const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Pastikan sharp terinstall: npm install sharp

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputImage = './public/icon-512x512.png'; // Ganti dengan path logo Anda (minimal 512x512)

// Create icons directory if it doesn't exist
if (!fs.existsSync('./public/icons')) {
  fs.mkdirSync('./public/icons', { recursive: true });
}

sizes.forEach(size => {
  sharp(inputImage)
    .resize(size, size)
    .toFile(`./public/icons/icon-${size}x${size}.png`)
    .then(() => console.log(`Generated icon-${size}x${size}.png`))
    .catch(err => console.error(`Error generating icon-${size}x${size}.png:`, err));
});

// Generate favicons
sharp(inputImage)
  .resize(16, 16)
  .toFile('./public/favicon-16x16.png');

sharp(inputImage)
  .resize(32, 32)
  .toFile('./public/favicon-32x32.png');