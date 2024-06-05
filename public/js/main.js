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

socket.on("init", (data, myId) => {
	console.log("init");

	world = new World({
		width: data.width,
		height: data.height
	});

	camera = new Camera(world);

	for (let playerData of data.players) {
		world.getOrCreatePlayer({
			id: playerData.id,
			name: playerData.name,
			cells: playerData.cells
		});
	}

	init();
});

socket.on("update_self", (playerData) => {
	yourself = world.getOrCreatePlayer({
		id: playerData.id,
		name: playerData.name,
		cells: playerData.cells
	});
});

socket.on("update_player", (playerData) => {
	world.getOrCreatePlayer({
		id: playerData.id,
		name: playerData.name,
		cells: playerData.cells
	});
});

function init() {
	// Register event handlers
	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();
	window.addEventListener("wheel", mouseWheel);

	// Render the scene
	runAnimation(() => {
		camera.render();
		world.update();
		if (yourself !== null) updatePlayer();
	});
}

function updatePlayer() {
	// Calculate the angle
	let center = yourself.getCenter();
	let angle = Math.atan2(
		canvas.height / 2 - keys["MouseY"],
		canvas.width / 2 - keys["MouseX"],
	);
	let dir = {
		x: Math.cos(angle),
		y: Math.sin(angle)
	}

	// Normalize the direction vector
	let length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
	dir.x *= -1 / length;
	dir.y *= -1 / length;

	// Set the direction
	yourself.setDirection(dir);

	// Update the camera
	camera.x = canvas.width / 2 - center.x;
	camera.y = canvas.height / 2 - center.y;
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