import { createCanvas } from './modules/canvas.js';

document.body.style.width = '100vw';
document.body.style.height = '100vh';
const [cnv, ctx] = createCanvas('cnv', document.body, 2, 3, 1);
console.log("canvas created");
console.log(cnv.width/cnv.height, 2/3);