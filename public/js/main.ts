import { getMouseX, getMouseY, isKeyPressed } from "./client/inputs.ts";
import {} from "./start.ts";
import Camera from "./client/camera.ts";
import World, { tps, type SerializedWorld } from "./common/world.ts";
import ticker from "./common/ticker.ts";
import type { SerializedPlayer } from "./common/player.ts";
import type { SerializedFood } from "./common/food.ts";
import type { SerializedVirus } from "./common/virus.ts";
import type Player from "./common/player.ts";
import { io } from "socket.io-client";

export const canvas = <HTMLCanvasElement>document.querySelector("canvas");
if (!canvas) throw new Error("Canvas not found");

export const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
if (!ctx) throw new Error("Context not found");

export const socket = io();

let yourself: Player | null = null;
let world: World | null = null;
let camera: Camera | null = null;

socket.once("init", (data: SerializedWorld) => {
    console.log("init");

    world = new World({
        width: data.width,
        height: data.height,
    });

    camera = new Camera(world);

    // TODO: set a random camera offset

    for (let playerData of data.players) {
        world.getOrCreatePlayer(playerData);
    }

    for (let foodData of data.foods) {
        world.getOrCreateFood(foodData);
    }

    for (let virusData of data.viruses) {
        world.getOrCreateVirus(virusData);
    }

    // Register event handlers
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    window.addEventListener("wheel", mouseWheel);
    window.addEventListener("keypress", keyDown);

    // Render the scene
    ticker(tps, (delta) => {
        if (!world || !camera || !yourself) return;

        // Build the quadtree
        world.buildQuadtree();

        // Render elements
        camera.render();

        // Tick objects
        world.tickPhysics(delta);

        if (yourself !== null) updatePlayer();
    });
});

socket.on("update_self", (playerData: SerializedPlayer) => {
    if (!world) {
        console.warn("'update_self' event received before initialization");
        return;
    }

    yourself = world.getOrCreatePlayer(playerData);
});

socket.on("update_player", (playerData: SerializedPlayer) => {
    if (!world) {
        console.warn("'update_player' event received before initialization");
        return;
    }

    world.getOrCreatePlayer(playerData);
});

socket.on("tick_players", (players: SerializedPlayer[]) => {
    if (!world) {
        console.warn("'tick_players' event received before initialization");
        return;
    }

    for (let playerData of players) {
        world.getOrCreatePlayer(playerData);
    }
});

socket.on("spawn_foods", (foods: SerializedFood[]) => {
    if (!world) {
        console.warn("'spawn_foods' event received before initialization");
        return;
    }

    for (let foodData of foods) {
        world.getOrCreateFood(foodData);
    }
});

socket.on("spawn_viruses", (viruses: SerializedVirus[]) => {
    if (!world) {
        console.warn("'spawn_viruses' event received before initialization");
        return;
    }

    for (let virusData of viruses) {
        world.getOrCreateVirus(virusData);
    }
});

socket.on("remove_player", (id: string) => {
    if (!world) {
        console.warn("'remove_player' event received before initialization");
        return;
    }

    world.removePlayer(id);
});

socket.on("death", () => {
    window.location.reload(); // TODO: put up death screen and not reload
});

socket.on("remove_food", (id: string) => {
    if (!world) {
        console.warn("'remove_food' event received before initialization");
        return;
    }

    world.removeFood(id);
});

socket.on("remove_virus", (id: string) => {
    if (!world) {
        console.warn("'remove_virus' event received before initialization");
        return;
    }

    world.removeVirus(id);
});

function updatePlayer() {
    if (!yourself || !camera) {
        console.warn("'updatePlayer' called before initialization");
        return;
    }

    // Calculate the angle
    let center = yourself.getCenter();

    // Set the direction
    let cellDirectionData: Record<string, { x: number; y: number; speedMultiplier: number }> = {};
    let cellChanged = false;

    yourself.cells.forEach((cell) => {
        if (!camera) return;

        // Calculate the angle
        let mouse = {
            y: getMouseY() + camera.offsetY,
            x: getMouseX() + camera.offsetX,
        };
        let angle = Math.atan2(cell.y - mouse.y, cell.x - mouse.x);
        let dir = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };

        // calculate the distance
        let dist = Math.sqrt(Math.pow(cell.x - mouse.x, 2) + Math.pow(cell.y - mouse.y, 2));

        // Normalize the direction vector
        let length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        dir.x *= -1 / length;
        dir.y *= -1 / length;

        let speedMultiplier = Math.min(dist / 20, 1);

        // Check if the direction is not different
        if (
            !(
                cell.dir.x === dir.x &&
                cell.dir.y === dir.y &&
                cell.speedMultiplier === speedMultiplier
            )
        ) {
            cellDirectionData[cell.id] = {
                x: dir.x,
                y: dir.y,
                speedMultiplier: speedMultiplier,
            };
            cellChanged = true;
        }

        cell.dir.x = dir.x;
        cell.dir.y = dir.y;
        cell.speedMultiplier = speedMultiplier;
    });

    // Update the camera
    camera.offsetX = center.x - canvas.width / 2;
    camera.offsetY = center.y - canvas.height / 2;

    if (cellChanged) socket.emit("direct_cells", cellDirectionData);
}

function resizeCanvas() {
    if (!camera) {
        console.warn("'resizeCanvas' called before initialization");
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.setDimensions(canvas.width, canvas.height);
}

function keyDown() {
    if (isKeyPressed("KeyW")) {
        socket.emit("eject");
    }
    if (isKeyPressed("Space")) {
        socket.emit("split");
    }
}

function mouseWheel({ ctrlKey, deltaY }: WheelEvent) {
    if (!camera) {
        console.warn("'mouseWheel' called before initialization");
        return;
    }

    if (ctrlKey) return;

    if (deltaY < 0) {
        console.log("out");
        camera.zoom *= 0.9;
    } else {
        console.log("in");
        camera.zoom *= 1.1;
    }
    // game.camera.scrollZoom = constrain(game.camera.scrollZoom, 0, 9000);
}
