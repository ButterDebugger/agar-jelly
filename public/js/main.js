import {} from "./start.js";
import Camera from "./client/camera.js";
import World from "./common/world.js";

export const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");
export const socket = io();

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
		world.getOrCreatePlayer({
			id: playerData.id,
			name: playerData.name,
			cells: playerData.cells
		});
	}

	init();
});

socket.on("update_player", (playerData) => {
	world.getOrCreatePlayer({
		id: playerData.id,
		name: playerData.name,
		cells: playerData.cells
	});
})

function init() {
	// Register event handlers
	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();
	window.addEventListener("wheel", mouseWheel);

	// Render the scene
	runAnimation(() => camera.render());
}

function draw() {
	ctx.fillStyle = "#1a1d23";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";

	game.render();
	game.update();
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