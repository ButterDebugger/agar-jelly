import { Rectangle } from "@timohausmann/quadtree-ts";
import { drawBackground, drawBlob } from "./graphics.js";
import Cell from "../common/cell.js";
import Food from "../common/food.js";
import { canvas, ctx } from "../main.js";
import Virus from "../common/virus.js";

export default class Camera extends Rectangle {
    #scale = 1;
    #offset = {
        x: 0,
        y: 0,
    }

    constructor(world) {
        super({
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
        });

        Object.defineProperty(this, "world", { value: world });

        this.size = {
            width: canvas.width,
            height: canvas.height,
        }
    }

    get zoom() {
        return this.#scale;
    }
    set zoom(value) {
        this.#scale = Math.min(2, value);
        this.#updateBounds();
    }

    get offsetX() {
        return this.#offset.x;
    }
    set offsetX(value) {
        this.#offset.x = value;
        this.#updateBounds();
    }

    get offsetY() {
        return this.#offset.y;
    }
    set offsetY(value) {
        this.#offset.y = value;
        this.#updateBounds();
    }

    setDimensions(width, height) {
        this.size.width = width;
        this.size.height = height;
        this.#updateBounds();
    }

    #updateBounds() {
        this.width = this.size.width * (1 / this.#scale);
        this.height = this.size.height * (1 / this.#scale);
        this.x = this.width / 2 * this.zoom - this.width / 2 + this.#offset.x;
        this.y = this.height / 2 * this.zoom - this.height / 2 + this.#offset.y;
    }

    render() {
        ctx.save();
        ctx.translate(this.size.width / 2, this.size.height / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(this.size.width / -2, this.size.height / -2);

        drawBackground(this);

        const elements = this.world.quadtree.retrieve(this);

        for (const element of elements) {
            if (element instanceof Cell || element instanceof Food || element instanceof Virus) {
                if (typeof element.was == "undefined") element.was = {};

                // TODO: find a better way to smooth the position because lerping simply reduces it
                let am = {
                    x: ((element.was.x ?? element.x) + element.x) / 2,
                    y: ((element.was.y ?? element.y) + element.y) / 2,
                    r: ((element.was.r ?? element.r) * 5 + element.r) / 6,
                }

                drawBlob(this, {
                    color: element.color,
                    x: am.x,
                    y: am.y,
                    r: am.r,
                });

                element.was.x = am.x;
                element.was.y = am.y;
                element.was.r = am.r;
            }
        }
        ctx.restore();
    }
}
