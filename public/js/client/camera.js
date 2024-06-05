import { Rectangle } from "@timohausmann/quadtree-ts";
import { drawBackground, drawCell } from "./graphics.js";
import Cell from "../common/cell.js";

export default class Camera extends Rectangle {
    constructor(world, options = {}) {
        super({
            x: options.x ?? 0,
            y: options.y ?? 0,
            width: options.width ?? window.innerWidth,
            height: options.height ?? window.innerHeight,
        });

		Object.defineProperty(this, "world", { value: world });
    }

    render() {
        drawBackground(this);

        const elements = this.world.quadtree.retrieve(this);

        for (const element of elements) {
            if (element instanceof Cell) {
                drawCell(this, element);
            }
            // TODO: render the object
        }
    }
}
