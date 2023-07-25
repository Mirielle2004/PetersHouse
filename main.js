import { createCanvas } from './modules/canvas.js';
import { Joystick, createArc } from "./modules/joystick/joystick.js";

document.body.style.width = '100vw';
document.body.style.height = '100vh';
const [cnv, ctx] = createCanvas('cnv', document.body, 2, 3, 1);
console.log("canvas created");
console.log(cnv.width/cnv.height, 2/3);

const player = {x: 0, y: 0, vx: 0, vy: 0, dir: "INIT"};

const gameLoop = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    player.x += player.vx;
    player.y += player.vy;
    ctx.fillRect(player.x, player.y, 64, 64);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "20px bolder verdana";
    ctx.fillText(player.dir, ctx.canvas.width * 0.5, ctx.canvas.height * 0.5);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

function onDragStart(e) {
    // const r = this.getBoundingRect();
    // const dx = e.startPos[0] - r.left;
    // const dy = e.startPos[1] - r.top;
    // console.log(dx, dy);
    // this.isActive = e.bundled.clientX < ctx.canvas.width * 0.5;
    // if(!this.isActive) this.deactivate();
}

function onDrag(e) {
    // console.log(e) to see all bundled
    const s = 0.04;
    player.vx = Math.cos(e.angle) * e.hypot * s;
    player.vy = Math.sin(e.angle) * e.hypot * s;
    player.dir = e.dir;
}

function onDragEnd(e) {
    player.vx = 0;
    player.vy = 0;
}

const jk = new Joystick({
    // position: "fixed",
    visibility: "dynamic",
    // throttleWithin: true,
    // outer: createArc(200, "yellow"),
    // inner: createArc(0.5, null, "red", 2),
    onDragStart, onDrag, onDragEnd
});

jk.domElement.id = "firstJoy";

jk.start();