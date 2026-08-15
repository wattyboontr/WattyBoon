import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateFavicons() {
  const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
  const publicDir = path.join(process.cwd(), 'public');

  if (!fs.existsSync(svgPath)) {
    console.error('favicon.svg not found!');
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. High-Res Favicon PNG (512x512 transparent)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Generated favicon.png (512x512)');

  // 2. 32x32 Favicon PNG
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ Generated favicon-32x32.png');

  // 3. 16x16 Favicon PNG
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✓ Generated favicon-16x16.png');

  // 4. Apple Touch Icon (180x180 for iOS Home Screen & Safari Favorites)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png (180x180)');

  // 5. Android Chrome 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'android-chrome-192x192.png'));
  console.log('✓ Generated android-chrome-192x192.png (192x192)');

  // 6. Android Chrome 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'android-chrome-512x512.png'));
  console.log('✓ Generated android-chrome-512x512.png (512x512)');

  // 7. Standard favicon.ico (using 48x48 PNG container)
  const ico48Buffer = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico48Buffer);
  console.log('✓ Generated favicon.ico (48x48)');

  console.log('All favicons and mobile app icons generated successfully with transparent background!');
}

generateFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});
