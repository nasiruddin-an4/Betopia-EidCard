const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function analyze() {
  const img = await loadImage('/Users/betopiagroup/Desktop/Web File/eid-card/public/Template bg.jpg');
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const cx = 545;
  const cy = 915;

  const width = img.width;
  const height = img.height;
  const buffer = ctx.getImageData(0, 0, width, height).data;

  function getPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return [0,0,0];
    const idx = (y * width + x) * 4;
    return [buffer[idx], buffer[idx+1], buffer[idx+2]];
  }

  // Get center color
  const centerColor = getPixel(cx, cy);
  console.log(`Center color at (${cx}, ${cy}):`, centerColor);

  function checkEdge(color) {
    // In our card representation: Cutout might be White or Very Light Gray because of photo clipping.
    // Let's print out some pixels walking left to see what exactly we have.
    return (Math.abs(color[0] - centerColor[0]) > 15 || 
            Math.abs(color[1] - centerColor[1]) > 15 || 
            Math.abs(color[2] - centerColor[2]) > 15);
  }

  // Find left edge
  let left = cx;
  while (left > 0) {
    const color = getPixel(left, cy);
    if (checkEdge(color)) break;
    left--;
  }

  // Find right edge
  let right = cx;
  while (right < width) {
    const color = getPixel(right, cy);
    if (checkEdge(color)) break;
    right++;
  }

  // Find top edge
  let top = cy;
  while (top > 0) {
    const color = getPixel(cx, top);
    if (checkEdge(color)) break;
    top--;
  }

  // Find bottom edge
  let bottom = cy;
  while (bottom < height) {
    const color = getPixel(cx, bottom);
    if (checkEdge(color)) break;
    bottom++;
  }

  console.log(`Bounds for center color:`);
  console.log(`Left: ${left}, Right: ${right}, Width: ${right - left}`);
  console.log(`Top: ${top}, Bottom: ${bottom}, Height: ${bottom - top}`);

  // Sample along a circle to verify it matches an ellipse formula
  const rx = (right - left) / 2;
  const ry = (bottom - top) / 2;
  const ncx = left + rx;
  const ncy = top + ry;
  console.log(`Calculated Center from Bounds: (${ncx}, ${ncy}), Rx=${rx}, Ry=${ry}`);

}

analyze().catch(console.error);
