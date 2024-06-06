import { randomUUID } from "node:crypto";
import ticker from "../public/js/common/ticker.js";
import World from "../public/js/common/world.js";
import { io } from "./index.js";

const randomInt = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1) + min);

const tps = 60;
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

    socket.emit("init", {
        tps: tps,
        ...world.serialize()
    });

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
}

function generateColor() {
    let color = [ 255, randomInt(36, 255), 36 ]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return color.reduce((str, c) => str += c.toString(16).padStart(2, "0"), "#");
}
