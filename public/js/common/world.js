import { Quadtree } from "@timohausmann/quadtree-ts";
import Player from "./player.js";

export default class World {
    constructor() {
        this.width = 10000;
        this.height = 10000;

        this.players = [];

        // Create the quadtree
        this.quadtree = new Quadtree({
            width: this.width,
            height: this.height
        });
    }

    update() {
        this.players.forEach(player => player.update());
    }

    addPlayer(options) {
        let player = new Player(this, options);
        this.players.push(player);
        return player;
    }

    // Serialize the data for sending
    serialize() {
        return {
            width: this.width,
            height: this.height,
            players: this.players.map(player => player.serialize())
        };
    }
}