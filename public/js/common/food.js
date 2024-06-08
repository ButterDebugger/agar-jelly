import { Circle } from "@timohausmann/quadtree-ts";
import { friction } from "./world.js";

export default class Food extends Circle {
    #mass;

    constructor(world, options = {}) {
        super({
            x: options.x ?? 0,
            y: options.y ?? 0,
            r: 0
        });

		Object.defineProperty(this, "world", { value: world });

        this.id = options.id;
        this.mass = options.mass ?? 0;
        this.color = options.color;
        this.vel = {
            x: options?.vel?.x ?? 0,
            y: options?.vel?.y ?? 0,
        };
    }

    // Map circle radius to the variable "mass"
    get mass() {
        return this.#mass;
    }
    set mass(value) {
        this.#mass = value;
        this.r = Math.max(10, value);
    }

    update(delta) {
        this.tickPhysics(delta);
    }

    tickPhysics(delta) {
        this.x += this.vel.x * delta;
        this.y += this.vel.y * delta;

        this.vel.x *= Math.pow(friction, delta);
        this.vel.y *= Math.pow(friction, delta);

        // Prevents the food from breaching the world's borders
        this.x = Math.max(0, Math.min(this.world.width, this.x));
        this.y = Math.max(0, Math.min(this.world.height, this.y));
    }

    addToQuadtree() {
        this.world.quadtree.insert(this);
    }

    remove() {
        return this.world.removeFood(this.id);
    }

    // Serialize the data for sending
    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            mass: this.mass,
            color: this.color,
            vel: this.vel
        };
    }
}