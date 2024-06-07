import keys from "https://debutter.dev/x/js/keys.js@1.1.0";
import {} from "./start.js";
import Camera from "./client/camera.js";
import World from "./common/world.js";
import ticker from "./common/ticker.js";

export const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");
export const socket = io();

let yourself = null;
let tps;
let world;
let camera;

socket.once("init", (data) => {
	console.log("init");

	tps = data.tps;

	world = new World({
		width: data.width,
		height: data.height
	});

	camera = new Camera(world);

	for (let playerData of data.players) {
		world.getOrCreatePlayer(playerData);
	}

	for (let foodData of data.foods) {
		world.getOrCreateFood(foodData);
	}

	init();
});

socket.on("update_self", (playerData) => {
	yourself = world.getOrCreatePlayer(playerData);
});

socket.on("update_player", (playerData) => {
	world.getOrCreatePlayer(playerData);
});

socket.on("tick_players", (players) => {
	for (let playerData of players) {
		world.getOrCreatePlayer(playerData);
	}
});

function init() {
	// Register event handlers
	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();
	window.addEventListener("wheel", mouseWheel);

	// Render the scene
	ticker(tps, (delta) => {
		// Build the quadtree
		world.buildQuadtree();

		// Render elements
		camera.render();

		// Tick objects
		world.update(delta);
		if (yourself !== null) updatePlayer();
	});
}

function updatePlayer() {
	// Calculate the angle
	let center = yourself.getCenter();

	// Set the direction
	let cellDirectionData = {};
	let cellChanged = false;

	yourself.cells.forEach(cell => {
		// Calculate the angle
		let mouse = {
			y: keys["MouseY"] + camera.offsetY,
			x: keys["MouseX"] + camera.offsetX,
		}
		let angle = Math.atan2(
			cell.y - mouse.y,
			cell.x - mouse.x,
		);
		let dir = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		}

		// calculate the distance
		let dist = Math.sqrt(Math.pow(cell.x - mouse.x, 2) + Math.pow(cell.y - mouse.y, 2));

		// Normalize the direction vector
		let length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
		dir.x *= -1 / length;
		dir.y *= -1 / length;

		let speedMultiplier = Math.min(dist / cell.mass, 1);

		// Check if the direction is not different
		if (!(cell.dir.x === dir.x && cell.dir.y === dir.y && cell.speedMultiplier === speedMultiplier)) {
			cellDirectionData[cell.id] = {
				x: dir.x,
				y: dir.y,
				speedMultiplier: speedMultiplier
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
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	camera.setDimensions(canvas.width, canvas.height);
}

function mouseWheel({ ctrlKey, wheelDeltaY }) {
	if (ctrlKey) return;

	if (wheelDeltaY < 0) {
		console.log("out");
		camera.zoom *= 0.9;
	} else {
		console.log("in");
		camera.zoom *= 1.1;
	}
	// game.camera.scrollZoom = constrain(game.camera.scrollZoom, 0, 9000);
}
