import { v4 as randomUUID } from "uuid";
import ticker from "../public/js/common/ticker.js";
import World, { tps } from "../public/js/common/world.js";
import { minEjectMass, ejectAmount, minSplitMass } from "../public/js/common/player.js";
import { io } from "./index.js";

const randomInt = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1) + min);

const world = new World({
    width: 10000,
    height: 10000
});

for (let i = 0; i < 1000; i++) {
    world.getOrCreateFood({
        id: randomUUID(),
        x: randomInt(0, world.width),
        y: randomInt(0, world.height),
        color: generateColor(),
        mass: 10
    });
}

export function init() {
    world.on("remove_food", (id) => {
        io.emit("remove_food", id);
    });

    ticker(tps, (delta) => {
        // Build the quadtree
        world.buildQuadtree();

        // Tick objects
        world.update(delta);

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
            x: 0,
            y: 0,
            mass: 20
        });

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
                    x: cell.x + cell.dir.x * cell.mass,
                    y: cell.y + cell.dir.y * cell.mass,
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
                    x: cell.x + cell.dir.x * cell.mass,
                    y: cell.y + cell.dir.y * cell.mass,
                    mass: cell.mass / 2,
                    vel: {
                        x: cell.dir.x * 10,
                        y: cell.dir.y * 10
                    }
                });
                cell.mass /= 2;

                io.emit("update_player", socket.player.serialize());
            }
        }
    });
}

function generateColor() {
    let color = [ 255, randomInt(36, 255), 36 ]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return color.reduce((str, c) => str += c.toString(16).padStart(2, "0"), "#");
}
