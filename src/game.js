import World from "../public/js/common/world.js";
import { io } from "./index.js";

let world = new World();

export function connectionHandler(socket) {
    console.log("connected");

    socket.player = null;

    socket.emit("init", world.serialize());

    socket.on("join", (name) => {
        if (typeof name !== "string") return;
        if (socket.player) return;

        let player = world.addPlayer({
            id: socket.id,
            name: name
        });
        player.addCell({
            x: 0,
            y: 0,
            mass: 10
        });
        // TODO: emit player update
    });
}

