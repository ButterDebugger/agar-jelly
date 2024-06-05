import { randomUUID } from "node:crypto";
import World from "../public/js/common/world.js";
import { io } from "./index.js";

let world = new World();

export function connectionHandler(socket) {
    socket.player = null;

    socket.emit("init", world.serialize());

    socket.on("join", (name) => {
        if (typeof name !== "string") return;
        if (socket.player) return;

        let player = world.getOrCreatePlayer({
            id: socket.id,
            name: name
        });
        player.addCell({
            id: randomUUID(),
            x: 0,
            y: 0,
            mass: 10
        });
        io.emit("update_player", player.serialize());
    });
}
