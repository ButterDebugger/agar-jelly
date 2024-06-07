import { Circle } from "@timohausmann/quadtree-ts";

const friction = 0.94;

export default class Food extends Circle {
    constructor(world, options = {}) {
        super({
            x: options.x ?? 0,
            y: options.y ?? 0,
            r: options.mass ?? 0
        });

		Object.defineProperty(this, "world", { value: world });

        this.id = options.id;
        this.color = options.color;
        this.vel = {
            x: options?.vel?.x ?? 0,
            y: options?.vel?.y ?? 0,
        };
    }

    // Map circle radius to the variable "mass"
    get mass() {
        return this.r;
    }
    set mass(value) {
        this.r = value;
    }

    update(delta) {
        this.x += this.vel.x * delta;
        this.y += this.vel.y * delta;

        this.vel.x *= Math.pow(friction, delta);
        this.vel.y *= Math.pow(friction, delta);

        this.handleWallCollision();
    }

    // Prevents the cell from breaching the world's borders
    handleWallCollision() {
        this.x = Math.max(0, Math.min(this.world.width, this.x));
        this.y = Math.max(0, Math.min(this.world.height, this.y));
    }

    addToQuadtree() {
        this.world.quadtree.insert(this);
    }

    remove() {
        let index = this.world.foods.indexOf(this);
        if (index === -1) return false;

        this.world.foods.splice(index, 1);
        return true;
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