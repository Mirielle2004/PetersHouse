import { createCanvas } from './modules/canvas.js';

document.body.style.width = '100vw';
document.body.style.height = '100vh';
createCanvas('cnv', document.body, 1, 2/3, 400);
console.log("canvas created");