const fs = require('fs');

async function main() {
  const { createCanvas, loadImage } = require('canvas');
  const img = await loadImage('public/Template bg.jpg');
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const cx = 534;
  const cy = 702;
  
  // Find radius right
  let rx = 0;
  for (let x = cx; x < canvas.width; x++) {
    const i = (cy * canvas.width + x) * 4;
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r < 240 || g < 240 || b < 240) {
      rx = x - cx;
      break;
    }
  }

  // Find radius left
  let lx = 0;
  for (let x = cx; x >= 0; x--) {
    const i = (cy * canvas.width + x) * 4;
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r < 240 || g < 240 || b < 240) {
      lx = cx - x;
      break;
    }
  }

  // Find radius up
  let uy = 0;
  for (let y = cy; y >= 0; y--) {
    const i = (y * canvas.width + cx) * 4;
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r < 240 || g < 240 || b < 240) {
      uy = cy - y;
      break;
    }
  }

  // Find radius down
  let dy = 0;
  for (let y = cy; y < canvas.height; y++) {
    const i = (y * canvas.width + cx) * 4;
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r < 240 || g < 240 || b < 240) {
      dy = y - cy;
      break;
    }
  }

  console.log(`rx: ${rx}, lx: ${lx}, uy: ${uy}, dy: ${dy}`);
}

main();
