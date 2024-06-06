import { Rectangle } from "@timohausmann/quadtree-ts";
import { drawBackground, drawBlob } from "./graphics.js";
import Cell from "../common/cell.js";
import Food from "../common/food.js";
import { ctx } from "../main.js";

export default class Camera extends Rectangle {
    constructor(world, options = {}) {
        super({
            x: options.x ?? 0,
            y: options.y ?? 0,
            width: options.width ?? window.innerWidth,
            height: options.height ?? window.innerHeight
        });

		Object.defineProperty(this, "world", { value: world });

        this.scale = 1;
    }

    get zoom() {
        return this.scale;
    }
    set zoom(value) {
        this.scale = Math.max(0.1, value);
    }

    render() {
        ctx.save();
        ctx.translate(this.width / 2, this.height / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(this.width / -2, this.height / -2);

        drawBackground(this);

        const elements = this.world.quadtree.retrieve(this);

        for (const element of elements) {
            if (element instanceof Cell || element instanceof Food) {
                drawBlob(this, element);
            }
        }
        ctx.restore();
    }
}
