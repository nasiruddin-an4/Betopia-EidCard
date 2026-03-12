const fs = require('fs');
async function main() {
  const { createCanvas, loadImage } = require('canvas');
  const img = await loadImage('public/Template bg.jpg');
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let minX=9999, maxX=0, minY=9999, maxY=0;
  for(let y=0; y<1200; y++) {
    for(let x=0; x<1200; x++) {
      const i = (y * canvas.width + x) * 4;
      const r=data[i], g=data[i+1], b=data[i+2];
      if (r>245 && g>245 && b>245) {
        if(x<minX) minX=x;
        if(x>maxX) maxX=x;
        if(y<minY) minY=y;
        if(y>maxY) maxY=y;
      }
    }
  }
  console.log(`minX:${minX} maxX:${maxX} minY:${minY} maxY:${maxY}`);
  console.log(`cx:${(minX+maxX)/2} cy:${(minY+maxY)/2} rX:${(maxX-minX)/2} rY:${(maxY-minY)/2}`);
}
main();
