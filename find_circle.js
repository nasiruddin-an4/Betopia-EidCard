const fs = require('fs');

async function main() {
  const { createCanvas, loadImage } = require('canvas');
  const img = await loadImage('public/Template bg.jpg');
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  let sumX = 0, sumY = 0, count = 0;
  let minX = canvas.width, maxX = 0;
  let minY = canvas.height, maxY = 0;

  for(let y=0; y<canvas.height; y++) {
    for(let x=0; x<canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      // Check for very light pixels (almost white interior)
      if (r > 250 && g > 250 && b > 250) {
        // limit to the top-left quadrant to avoid other white areas
        if (x < canvas.width / 2 && y < canvas.height / 2 + 300) {
            sumX += x;
            sumY += y;
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
      }
    }
  }
  
  const cx = sumX / count;
  const cy = sumY / count;
  const radiusX = (maxX - minX) / 2;
  const radiusY = (maxY - minY) / 2;
  console.log(`Center: ${cx}, ${cy}`);
  console.log(`Radius X: ${radiusX}, Radius Y: ${radiusY}`);
  console.log(`MinX: ${minX}, MaxX: ${maxX}, MinY: ${minY}, MaxY: ${maxY}`);
}

main();
