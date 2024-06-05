import { Circle } from "@timohausmann/quadtree-ts";

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
    }

    // Map circle radius to the variable "mass"
    get mass() {
        return this.r;
    }
    set mass(value) {
        this.r = value;
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
            color: this.color
        };
    }
}