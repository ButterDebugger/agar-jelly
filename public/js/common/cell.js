import { Circle } from "@timohausmann/quadtree-ts";
import Food from "./food.js";

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

        this.id = options.id;
        this.speedMultiplier = options.speedMultiplier ?? 1;
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
        return (this.mass / Math.pow(this.mass, 1.44)) * 10;
    }

    // Get parent player color
    get color() {
        return this.player.color;
    }

    update(delta) {
        this.tickPhysics(delta);
        this.handleFoodCollision();
    }

    tickPhysics(delta) {
        // Move cell in direction
        let speed = this.speed;

        this.x += this.dir.x * speed * this.speedMultiplier * delta;
        this.y += this.dir.y * speed * this.speedMultiplier * delta;

        // Prevents the cell from breaching the world's borders
        this.x = Math.max(0, Math.min(this.player.world.width, this.x));
        this.y = Math.max(0, Math.min(this.player.world.height, this.y));
    }

    handleFoodCollision() {
        // Get nearby object in the worlds quadtree
        const elements = this.player.world.quadtree.retrieve(this);

        for (let element of elements) {
            if (element instanceof Food) {
                if (this.mass < element.mass) continue;

                let dist = Math.sqrt(Math.pow(element.x - this.x, 2) + Math.pow(element.y - this.y, 2));

                if (dist < this.r - element.r / 2) {
                    element.remove();
                    this.mass += element.mass;
                }
            }
        }
    }

    addToQuadtree() {
        this.player.world.quadtree.insert(this);
    }

    remove() {
        let index = this.player.cells.indexOf(this);
        if (index === -1) return false;

        this.player.cells.splice(index, 1);
        return true;
    }

    // Serialize the data for sending
    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            mass: this.mass,
            dir: this.dir
        };
    }
}