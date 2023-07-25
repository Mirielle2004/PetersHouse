/**
 * @todo
 * outline width consideration
 * fix for position(fixed) visibility(dynamic) not working
 * touch support
 */
type vec2 = [number, number];

type dyno = "dynamic" | "fixed";

type NullableFunction = Function | null;

type circle = {
    pos?: vec2,
    radius: number,
    fillColor: string | null,
    outlineColor: string | null,
    outlineWidth: number
}

interface iJoystickInitParam {
    position?: dyno,
    visibility?: dyno,
    throttleWithin?: boolean;
    outer?: circle,
    inner?: circle,
    onDragStart?: Function,
    onDrag?: Function,
    onDragEnd?: Function
}


// weird function name to avoid name conflicts should this be merged with another
const __joystick__melle__lib__ = (() => {

    let isInitialised = false;
    let touchSupport = false;
    const init = () => {
        if(isInitialised) return;
        isInitialised = true;
        touchSupport = window.matchMedia("(pointer: coarse)").matches;
    }
    return { init, touchSupport };
})();

class Joystick {

    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;
    #outer: circle;
    #inner: circle;
    #radius = 0;

    #position: dyno;
    #visibility: dyno;

    #angle = 0;
    #hypot = 0;
    isActive = false;
    #dir = "";
    #opacity = 0;
    #startPos: vec2 = [0, 0];
    #endPos: vec2 = [0, 0];
    #throttleWithin = false;
    // event handling functions
    #onDragStart: NullableFunction = null;
    #onDrag: NullableFunction = null;
    #onDragEnd: NullableFunction = null;


    /**
     * This constructor creates an instance of a Joystick and initialises it's properties
     * @constructor
     * @param prop is an object describing the properties to be set (optional)
     */
    constructor(prop: iJoystickInitParam = { }) {

        __joystick__melle__lib__.init();

        this.#position = prop.position || "dynamic";
        this.#visibility = prop.visibility || "fixed";

        this.#canvas = document.createElement("canvas");
        this.#ctx = <CanvasRenderingContext2D>this.#canvas.getContext("2d");
        this.#onDragStart = prop.onDragStart;
        this.#onDrag = prop.onDrag;
        this.#onDragEnd = prop.onDragEnd;
        this.#throttleWithin = prop.throttleWithin || false;

        this.#canvas.style.border = "none";
        this.#canvas.style.outline = "none";
        document.body.append(this.#canvas);

        let r1 = prop.outer?.radius ? prop.outer.radius : 100;
        let r2 = (Math.min(0.9, prop.inner?.radius || 0.3)) * r1;
        this.radius = r1 + r2;

        r1 *= 0.5;
        r2 *= 0.5;

        const mp = this.radius * 0.5;

        this.#outer = {
            pos: [mp, mp],
            radius: r1,
            fillColor: prop.outer?.fillColor,
            outlineColor: prop.outer?.outlineColor || "#222",
            outlineWidth: prop.outer?.outlineWidth || 5
        };

        this.#inner = {
            pos: [mp, mp],
            radius:  r2,
            fillColor: prop.inner?.fillColor || "#fff",
            outlineColor: prop.inner?.outlineColor || "#222",
            outlineWidth: prop.inner?.outlineWidth || 2
        };

        this.#opacity = 1;

        if(this.#position === "dynamic") {
            this.#canvas.style.position = "absolute";
            this.#canvas.style.left = "0px";
            this.#canvas.style.top = "0px";
        }

        if(this.#visibility === "dynamic") this.deactivate();

        window.addEventListener("mousedown", e => {
            this.#handlePointerDown(e);
        });

        window.addEventListener("mousemove", e => {
            this.#handlePointerMove(e);
        });

        window.addEventListener("mouseup", e => {
            this.#handlePointerUp(e);
        });
    }

    getBoundingRect(): DOMRect { return this.#canvas.getBoundingClientRect(); }

    get domElement(): HTMLCanvasElement { return this.#canvas; }


    set radius(r: number) {
        this.#radius = r;
        this.#canvas.style.width = r + "px";
        this.#canvas.style.height = r + "px";
        this.#canvas.width = r;
        this.#canvas.height = r;
    }


    get radius(): number { return this.#radius; }

    deactivate() {
        this.#canvas.remove();
    }

    activate() {
        this.#opacity = 1;
        document.body.append(this.#canvas);
    }


    /**
     * This method is required to be called to initialise and start the joystick implementations on the screen
     */
    start(): void {
        const loop = () => {
            this.#update();
            this.#draw();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }


    /**
     * This method is called to animate throttle drag, opacity etc... at every joystick frame
     * @private
     */
    #update(): void {
        if(this.#visibility === "fixed") {
            this.#opacity = 1;
        } else if(this.#visibility === "dynamic") {
            if(!this.isActive) this.#opacity -= 0.03;
            if(this.#opacity <= 0) this.#opacity = 0;
        }
        this.#canvas.style.opacity = String(this.#opacity);
        const px = this.radius * 0.5 + Math.cos(this.#angle) * this.#hypot;
        const py = this.radius * 0.5 + Math.sin(this.#angle) * this.#hypot;
        this.#inner.pos = [px, py];
    }


    /**
     * This method is called to draw the actual joystick at every joystick frame
     * @method
     * @private
     */
    #draw(): void {
        const ctx = <CanvasRenderingContext2D>this.#ctx;
        ctx.clearRect(0, 0, this.radius, this.radius);
        this.#drawRect(ctx, this.#outer);
        this.#drawRect(ctx, this.#inner);
    }


    /**
     * This method draws an arc on a 2d canvas
     * @method
     * @param ctx is the 2d rendering context
     * @param c is the circle parameters to be drawn
     * @private
     */
    #drawRect(ctx: CanvasRenderingContext2D, c: circle) {
        ctx.lineWidth = c.outlineWidth;
        ctx.beginPath();
        ctx.arc(...c.pos, c.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = c.fillColor;
        ctx.strokeStyle = c.outlineColor;
        // short circuit for filling and stroking ctx path
        c.fillColor && ctx.fill();
        c.outlineColor && ctx.stroke();
    }

    #handlePointerDown(e: MouseEvent | TouchEvent) {

        let pos: Array<number> = new Array(2);

        if("touches" in e &&  __joystick__melle__lib__.touchSupport) {
            pos = [e.touches[0].pageX, e.touches[0].pageY];
        } else if("clientX" in e && "clientY" in e && ! __joystick__melle__lib__.touchSupport)
            pos = [e.clientX, e.clientY];

        switch (this.#position) {
            case "dynamic":
                this.#canvas.style.left = pos[0] - this.radius * 0.5 + "px";
                this.#canvas.style.top = pos[1] - this.radius * 0.5 + "px";
                if(this.#visibility === "dynamic") this.activate();
                this.isActive = true;
                break;
            default:
                const rect = this.getBoundingRect();
                const px = pos[0] - (rect.left + this.radius * 0.5);
                const py = pos[1] - (rect.top + this.radius * 0.5);
                if(this.#visibility === "dynamic") {
                    if(Math.hypot(px, py) <= this.#outer.radius) {
                        // console.log("clicking me");
                        this.activate();
                    }
                    // this.activate();
                }
                if(Math.hypot(px, py) <= this.#inner.radius) {
                    this.isActive = true;
                }
        }

        // reset some bundled parameters
        this.#angle = 0;
        this.#hypot = 0;
        this.#dir = "";
        this.#startPos = [pos[0], pos[1]];

        // call the event callback if the joystick is active
        if(this.isActive) {
            if(this.#onDragStart && typeof this.#onDragStart === "function")
                this.#onDragStart({ dir: null, startPos: pos,
                    currPos: pos, diffPos: [0, 0], bundled: e});
        }
    }


    #handlePointerMove(e: MouseEvent | TouchEvent) {
        if(this.isActive) {
            this.#opacity = 1;
            let currPos;
            if("touches" in e) {

            } else if("clientX" in e) {
                this.#endPos = [e.clientX, e.clientY];
                currPos = [e.clientX, e.clientY];
            }
            const dx = this.#endPos[0] - this.#startPos[0];
            const dy = this.#endPos[1] - this.#startPos[1];
            this.#angle = Math.atan2(dy, dx);
            const mh = this.#throttleWithin ? this.#inner.radius : 0;
            this.#hypot = Math.min(Math.hypot(dx, dy), this.#outer.radius - mh);
            // direction from throttle move
            if(Math.abs(dx) > Math.abs(dy)) this.#dir = dx < 0 ? "left" : "right";
            else this.#dir = dy < 0 ? "up" : "down";
            // bundled instances
            if(this.#onDrag && typeof this.#onDrag === "function")
                this.#onDrag({ dir: this.#dir, startPos: this.#startPos,
                    currPos, diffPos: [dx, dy], angle: this.#angle, hypot: this.#hypot, bundled: e });
        }
    }


    #handlePointerUp(e: MouseEvent) {
        if(this.isActive) {
            const currPos = [e.clientX, e.clientY];
            // bundled instances
            if(this.#onDragEnd && typeof this.#onDragEnd === "function")
                this.#onDragEnd({ dir: this.#dir, startPos: this.#startPos,
                    currPos, diffPos: [0, 0], bundled: e });

            this.#startPos = [0, 0];
            this.#angle = 0;
            this.#hypot = 0;
            this.isActive = false;
            this.#dir = "";
        }
    }

}


const createArc = (radius: number, fillColor: string, outlineColor: string,
                   outlineWidth: number) => ({ radius, fillColor, outlineColor, outlineWidth });


export {Joystick, createArc }