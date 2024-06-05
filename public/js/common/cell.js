import { Circle } from "@timohausmann/quadtree-ts";

export const maxSpeed = 10;
export const minSpeed = 1;

export default class Cell extends Circle {
    constructor(player, options = {}) {
        super({
            x: options.x ?? 0,
            y: options.y ?? 0,
            r: options.mass ?? 0
        });

		Object.defineProperty(this, "player", { value: player });

        this.player.world.quadtree.insert(this);

        this.id = options.id;
        this.speedMultiplier = 1;
        this.dir = {
            x: 0,
            y: 0
        };
    }

    // Map circle radius to the variable "mass"
    get mass() {
        return this.r;
    }
    set mass(value) {
        this.r = value;
    }

    // Based on the mass, calculate the speed
    get speed() {
        return Math.max(Math.min(4.2 * Math.pow(this.mass / 50, -0.319), maxSpeed), minSpeed);
    }

    // Get parent player color
    get color() {
        return this.player.color;
    }

    update() {
        // Move cell in direction
        let speed = this.speed;

        this.x += this.dir.x * speed * this.speedMultiplier;
        this.y += this.dir.y * speed * this.speedMultiplier;
    }

    remove() {
        let index = this.player.cells.indexOf(this);
        if (index === -1) return false;

        // TODO: remove cell from quadtree

        this.player.cells.splice(index, 1);
        return true;
    }

    // Serialize the data for sending
    serialize() {
        return {
            x: this.x,
            y: this.y,
            mass: this.mass,
            dir: this.dir
        };
    }
}