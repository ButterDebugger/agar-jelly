import { Circle } from "@timohausmann/quadtree-ts";
import Food from "./food.js";
import { friction } from "./world.js";
import { consumeGainPercent, consumePercent } from "./player.js";

export const maxSpeed = 10;
export const minSpeed = 1;
export const minMassDecay = 20;
export const massDecayPercent = 0.00003;

export default class Cell extends Circle {
    #mass;

    constructor(player, options = {}) {
        super({
            x: options.x ?? 0,
            y: options.y ?? 0,
            r: 0
        });

        Object.defineProperty(this, "player", { value: player });

        this.id = options.id;
        this.mass = options.mass ?? 0;
        this.speedMultiplier = options.speedMultiplier ?? 1;
        this.dir = {
            x: options?.dir?.x ?? 0,
            y: options?.dir?.y ?? 0,
        };
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

    // Based on the mass, calculate the speed
    get speed() {
        return (this.mass / Math.pow(this.mass, 1.33)) * 10;
    }

    // Get parent player color
    get color() {
        return this.player.color;
    }

    update(delta) {
        this.tickPhysics(delta);
        this.handleFoodCollision();
        this.handleMassDecay(delta);
    }

    tickPhysics(delta) {
        // Move cell in direction
        let speed = this.speed;

        this.x += this.dir.x * speed * this.speedMultiplier * delta;
        this.y += this.dir.y * speed * this.speedMultiplier * delta;

        // Apply velocity
        this.x += this.vel.x * delta;
        this.y += this.vel.y * delta;

        this.vel.x *= Math.pow(friction, delta);
        this.vel.y *= Math.pow(friction, delta);

        // Prevents the cell from breaching the world's borders
        this.x = Math.max(0, Math.min(this.player.world.width, this.x));
        this.y = Math.max(0, Math.min(this.player.world.height, this.y));
    }

    handleFoodCollision() {
        // Get nearby object in the worlds quadtree
        const elements = this.player.world.quadtree.retrieve(this);

        for (let element of elements) {
            if (element instanceof Food || element instanceof Cell) {
                if (this.mass * consumePercent <= element.mass) continue;

                let dist = Math.sqrt(Math.pow(element.x - this.x, 2) + Math.pow(element.y - this.y, 2));

                if (dist < this.r - element.r / 2) {
                    element.remove();
                    this.mass += element.mass * consumeGainPercent;
                }
            }
        }
    }

    handleMassDecay(delta) {
        if (this.mass > minMassDecay) {
            let decay = this.mass * massDecayPercent * delta;

            this.mass = Math.max(this.mass - decay, minMassDecay);
        }
    }

    addToQuadtree() {
        this.player.world.quadtree.insert(this);
    }

    remove() {
        return this.player.removeCell(this.id);
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