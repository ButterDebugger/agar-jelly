import { randomUUID } from "node:crypto";
import World from "../public/js/common/world.js";
import { io } from "./index.js";

const randomInt = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1) + min);

let world = new World({
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

        let serializedPlayer = player.serialize();

        socket.broadcast.emit("update_player", serializedPlayer);
        socket.emit("update_self", serializedPlayer)
    });
}

function generateColor() {
    let color = [ 255, randomInt(36, 255), 36 ]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return color.reduce((str, c) => str += c.toString(16).padStart(2, "0"), "#");
}
