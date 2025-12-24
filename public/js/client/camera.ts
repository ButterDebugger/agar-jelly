import { Rectangle } from "@timohausmann/quadtree-ts";
import { drawBackground, drawBlob, drawCenteredText } from "./graphics.ts";
import Cell from "../common/cell.ts";
import Food from "../common/food.ts";
import { canvas, ctx, debug } from "../main.ts";
import Virus from "../common/virus.ts";
import type World from "../common/world.ts";
import { lerp } from "@debutter/helper";

export default class Camera extends Rectangle {
    #scale = 1;
    #offset = {
        x: 0,
        y: 0,
    };

    world: World;
    size: { width: number; height: number };

    constructor(world: World) {
        super({
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
        });

        this.world = world;
        this.size = {
            width: canvas.width,
            height: canvas.height,
        };
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

    setDimensions(width: number, height: number) {
        this.size.width = width;
        this.size.height = height;
        this.#updateBounds();
    }

    #updateBounds() {
        this.width = this.size.width * (1 / this.#scale);
        this.height = this.size.height * (1 / this.#scale);
        this.x = (this.width / 2) * this.zoom - this.width / 2 + this.#offset.x;
        this.y = (this.height / 2) * this.zoom - this.height / 2 + this.#offset.y;
    }

    render(delta: number) {
        ctx.save();
        ctx.translate(this.size.width / 2, this.size.height / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(this.size.width / -2, this.size.height / -2);

        drawBackground(this);

        const elements = this.world.quadtree.retrieve(this);

        for (const element of elements) {
            if (element instanceof Cell || element instanceof Food || element instanceof Virus) {
                if (typeof element.was == "undefined") {
                    element.was = { x: element.x, y: element.y, r: element.r };
                }

                // Lerp between last rendered position and current position using delta
                const lerpFactor = delta * 10;

                let am = {
                    x: lerp(element.was.x, element.x, lerpFactor),
                    y: lerp(element.was.y, element.y, lerpFactor),
                    r: lerp(element.was.r, element.r, lerpFactor),
                };

                drawBlob(this, {
                    color: element.color,
                    x: am.x,
                    y: am.y,
                    r: am.r,
                });

                element.was.x = am.x;
                element.was.y = am.y;
                element.was.r = am.r;

                // Display debug information if debug mode is enabled
                if (debug) {
                    drawCenteredText(
                        this,
                        am.x,
                        am.y + am.r + 16,
                        `mass: ${element.mass.toFixed(0)}`,
                    );
                    drawCenteredText(
                        this,
                        am.x,
                        am.y + am.r + 16 * 2,
                        `pos: <${element.x}, ${element.y}>`,
                    );
                    drawCenteredText(
                        this,
                        am.x,
                        am.y + am.r + 16 * 3,
                        `vel: <${element.vel.x}, ${element.vel.y}>`,
                    );

                    if (element instanceof Cell) {
                        // Display cell specific information
                        drawCenteredText(
                            this,
                            am.x,
                            am.y + am.r + 16 * 4,
                            `dir: <${element.dir.x}, ${element.dir.y}>`,
                        );
                        drawCenteredText(
                            this,
                            am.x,
                            am.y + am.r + 16 * 5,
                            `speed | multiplier: ${element.speed} | ${element.speedMultiplier}`,
                        );
                    }
                }
            }
        }
        ctx.restore();
    }
}
