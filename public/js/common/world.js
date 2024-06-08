import { Quadtree } from "@timohausmann/quadtree-ts";
import EventEmitter from "eventemitter3";
import Player from "./player.js";
import Food from "./food.js";

export default class World extends EventEmitter {
    constructor(options = {}) {
        super();

        this.width = options.width ?? 10000;
        this.height = options.height ?? 10000;

        this.players = [];
        this.foods = [];

        // Create the quadtree
        this.quadtree = new Quadtree({
            width: this.width,
            height: this.height
        });
    }

    update(delta) {
        this.players.forEach(player => player.update(delta));
        this.foods.forEach(food => food.update(delta));
    }

    tickPhysics(delta) {
        this.players.forEach(player => player.tickPhysics(delta));
        this.foods.forEach(food => food.tickPhysics(delta));
    }

    buildQuadtree() {
        this.quadtree.clear();

        // Readd all the worlds objects to the quadtree
        for (let player of this.players) {
            player.addToQuadtree();
        }
        for (let food of this.foods) {
            food.addToQuadtree();
        }
    }

    getOrCreatePlayer(options) {
        if (typeof options.id == "string") {
            // Find a player with a matching id
            let player = this.players.find(p => p.id === options.id);

            // If the player exists, rewrite its properties
            if (player) {
                if (options.name) player.name = options.name;
                if (options.color) player.color = options.color;
                if (options.cells) {
                    let cellIds = options.cells.map(c => c.id);

                    for (let cell of player.cells) {
                        if (!cellIds.includes(cell.id)) {
                            cell.remove();
                        }
                    }

                    for (let cellData of options.cells) {
                        player.addCell({
                            id: cellData.id,
                            x: cellData.x,
                            y: cellData.y,
                            dir: cellData.dir,
                            mass: cellData.mass
                        });
                    }
                }

                // Return the existing player
                return player;
            }
        }

        // Create a new player since it doesn't already exist
        let player = new Player(this, options);
        this.players.push(player);
        return player;
    }

    getOrCreateFood(options) {
        if (typeof options.id == "string") {
            // Find a food with a matching id
            let food = this.foods.find(f => f.id === options.id);

            // If the food exists, rewrite its properties
            if (food) {
                if (options.x) food.x = options.x;
                if (options.y) food.y = options.y;
                if (options.mass) food.mass = options.mass;
                if (options.color) food.color = options.color;
                if (options.vel) {
                    food.vel.x = options.vel.x;
                    food.vel.y = options.vel.y;
                }

                // Return the existing food
                return food;
            }
        }

        // Create a new food since it doesn't already exist
        let food = new Food(this, options);
        this.foods.push(food);
        return food;
    }

    removePlayer(id) {
        let index = this.players.findIndex(p => p.id === id);
        if (index === -1) return false;

        this.players.splice(index, 1);
        // TODO: emit remove_player
        return true;
    }

    removeFood(id) {
        let index = this.foods.findIndex(f => f.id === id);
        if (index === -1) return false;

        this.foods.splice(index, 1);
        this.emit("remove_food", id);
        return true;
    }

    // Serialize the data for sending
    serialize() {
        return {
            width: this.width,
            height: this.height,
            players: this.players.map(player => player.serialize()),
            foods: this.foods.map(food => food.serialize())
        };
    }
}