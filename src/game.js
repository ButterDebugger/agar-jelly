import { v4 as randomUUID } from "uuid";
import ticker from "../public/js/common/ticker.js";
import World, { tps } from "../public/js/common/world.js";
import { minEjectMass, ejectAmount, minSplitMass } from "../public/js/common/player.js";
import { io } from "./index.js";

const randomInt = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1) + min);

const foodAmount = 1000;
const world = new World({
    width: 10000,
    height: 10000
});

generateFood(foodAmount);

export function init() {
    world.on("remove_food", (food) => {
        io.emit("remove_food", food.id);
    });
    world.on("remove_player", (player) => {
        player.socket.broadcast.emit("remove_player", player.id);
        player.socket.emit("death");
    });

    ticker(tps, (delta) => {
        // Build the quadtree
        world.buildQuadtree();

        // Tick objects
        world.update(delta);

        // Add new food NOTE: should probably just spawn food every couple seconds instead
        if (foodAmount - world.foods.length > 0) {
            io.emit("spawn_foods", generateFood().map(p => p.serialize()));
        }

        io.volatile.emit("tick_players", world.players.map(p => p.serialize()));
    });
}

export function connectionHandler(socket) {
    socket.player = null;

    socket.emit("init", world.serialize());

    socket.on("join", (name) => {
        if (typeof name !== "string") return;
        if (socket.player) return;

        let player = world.getOrCreatePlayer({
            id: socket.id,
            name: name,
            color: generateColor()
        });
        player.addCell({
            id: randomUUID(),
            x: randomInt(0, world.width),
            y: randomInt(0, world.height),
            mass: 20
        });

        player.socket = socket;
        socket.player = player;

        let serializedPlayer = player.serialize();

        socket.broadcast.emit("update_player", serializedPlayer);
        socket.emit("update_self", serializedPlayer);
    });

    socket.on("direct_cells", (data) => {
        if (!socket.player) return;

        for (let cell of socket.player.cells) {
            if (cell.id in data) {
                cell.dir.x = data[cell.id].x;
                cell.dir.y = data[cell.id].y;
                cell.speedMultiplier = data[cell.id].speedMultiplier;
            }
        }
    });

    socket.on("eject", () => {
        if (!socket.player) return;

        let newFoods = [];

        for (let cell of socket.player.cells) {
            if (cell.mass >= minEjectMass + ejectAmount) {
                let food = world.getOrCreateFood({
                    id: randomUUID(),
                    x: cell.x + cell.dir.x * cell.r,
                    y: cell.y + cell.dir.y * cell.r,
                    color: socket.player.color,
                    mass: ejectAmount,
                    vel: {
                        x: cell.dir.x * 10,
                        y: cell.dir.y * 10
                    }
                });
                newFoods.push(food.serialize());

                cell.mass -= ejectAmount;
            }
        }

        io.emit("spawn_foods", newFoods)
    });

    socket.on("split", () => {
        if (!socket.player) return;

        for (let cell of [...socket.player.cells]) {
            if (cell.mass >= minSplitMass) {
                socket.player.addCell({
                    id: randomUUID(),
                    x: cell.x + cell.dir.x * cell.r,
                    y: cell.y + cell.dir.y * cell.r,
                    mass: cell.mass / 2,
                    dir: {
                        x: cell.dir.x,
                        y: cell.dir.y
                    },
                    vel: {
                        x: cell.dir.x * 15,
                        y: cell.dir.y * 15
                    }
                });
                cell.mass /= 2;

                io.emit("update_player", socket.player.serialize());
            }
        }
    });

    socket.on("disconnect", () => {
        if (!socket.player) return;

        world.removePlayer(socket.player.id);

        socket.broadcast.emit("remove_player", socket.player.id);
        socket.player = null;
    })
}

function generateFood(amount = 1) {
    let foods = [];

    for (let i = 0; i < amount; i++) {
        foods.push(world.getOrCreateFood({
            id: randomUUID(),
            x: randomInt(0, world.width),
            y: randomInt(0, world.height),
            color: generateColor(),
            mass: 7
        }));
    }

    return foods;
}

function generateColor() {
    let color = [ 255, randomInt(36, 255), 36 ]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return color.reduce((str, c) => str += c.toString(16).padStart(2, "0"), "#");
}
