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

    getOrCreatePlayer(options) {
        if (typeof options.id == "string") {
            // Find a player with a matching id
            let player = this.players.find(p => p.id === options.id);

            // If the player exists, rewrite its properties
            if (player) {
                if (options.name) player.name = options.name;
                if (options.color) player.color = options.color;
                if (options.cells) {
                    let cellIds = playerData.cells.map(c => c.id);

                    for (let cell of player.cells) {
                        if (!cellIds.includes(cell.id)) {
                            cell.remove();
                        }
                    }

                    for (let cellData of playerData.cells) {
                        player.addCell({
                            id: cellData.id,
                            x: cellData.x,
                            y: cellData.y,
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

    // Serialize the data for sending
    serialize() {
        return {
            width: this.width,
            height: this.height,
            players: this.players.map(player => player.serialize())
        };
    }
}