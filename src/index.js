import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { connectionHandler, init } from "./game.js";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT ?? 3000;
export const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (...args) => {
	console.log("a user connected");

	connectionHandler(...args);
});

init();

server.listen(port, () => {
	console.log("listening on *:3000");
});
