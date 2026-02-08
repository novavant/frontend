// generate-splash.js
const sharp = require('sharp');

const splashScreens = [
  { width: 750, height: 1334, name: 'splash-750x1334.png' },
  { width: 828, height: 1792, name: 'splash-828x1792.png' },
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
  { width: 1170, height: 2532, name: 'splash-1170x2532.png' },
  { width: 1179, height: 2556, name: 'splash-1179x2556.png' },
  { width: 1242, height: 2688, name: 'splash-1242x2688.png' },
  { width: 1284, height: 2778, name: 'splash-1284x2778.png' },
  { width: 1290, height: 2796, name: 'splash-1290x2796.png' },
  { width: 1668, height: 2224, name: 'splash-1668x2224.png' },
  { width: 1668, height: 2388, name: 'splash-1668x2388.png' },
  { width: 2048, height: 2732, name: 'splash-2048x2732.png' }
];

// Create splash directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./public/splash')) {
  fs.mkdirSync('./public/splash', { recursive: true });
}

splashScreens.forEach(screen => {
  // Create a splash screen with background color and logo
  sharp({
    create: {
      width: screen.width,
      height: screen.height,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 } // #0A0A0A background
    }
  })
  .composite([
    {
      input: './public/icon-512x512.png', // Your logo
      gravity: 'center'
    }
  ])
  .toFile(`./public/splash/${screen.name}`)
  .then(() => console.log(`Generated ${screen.name}`))
  .catch(err => console.error(`Error generating ${screen.name}:`, err));
});