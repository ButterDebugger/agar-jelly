import keys from "https://debutter.dev/x/js/keys.js@1.1.0";
import {} from "./start.js";
import Camera from "./client/camera.js";
import World from "./common/world.js";

export const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");
export const socket = io();

let yourself = null;
let world;
let camera;

socket.on("init", (data) => {
	console.log("init");

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

function init() {
	// Register event handlers
	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();
	window.addEventListener("wheel", mouseWheel);

	// Render the scene
	runAnimation(() => {
		world.buildQuadtree();
		camera.render();
		world.update();
		if (yourself !== null) updatePlayer();
	});
}

function updatePlayer() {
	// Calculate the angle
	let center = yourself.getCenter();

	// Set the direction
	yourself.cells.forEach(cell => {
		// Calculate the angle
		let mouse = {
			y: keys["MouseY"] + camera.y,
			x: keys["MouseX"] + camera.x,
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

		cell.dir.x = dir.x;
		cell.dir.y = dir.y;
		cell.speedMultiplier = Math.min(dist / cell.mass, 1);
	});

	// Update the camera
	camera.x = center.x - canvas.width / 2;
	camera.y = center.y - canvas.height / 2;
}

function resizeCanvas() {
	camera.width = canvas.width = window.innerWidth;
	camera.height = canvas.height = window.innerHeight;
}

function mouseWheel({ wheelDeltaY }) {
	let toBottom = wheelDeltaY < 0;
	if (toBottom) {
		game.camera.scrollZoom += 100;
	} else {
		game.camera.scrollZoom -= 100;
	}
	game.camera.scrollZoom = constrain(game.camera.scrollZoom, 0, 9000);
}








function runAnimation(animation) { // TODO: replace code with import
	let lastTime = null;
	const frame = async (time) => {
		let timeStep = lastTime === null ? 0 : 1000 / (time - lastTime);

		if ((await animation(time, timeStep)) === false) {
			return; // Stop animation
		}

		lastTime = time;
		requestAnimationFrame(frame); // Request another frame
	};
	requestAnimationFrame(frame); // Begin animation
}