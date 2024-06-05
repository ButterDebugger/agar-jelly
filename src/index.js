import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { connectionHandler } from "./game.js";

const app = express();
const server = http.createServer(app);
export const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (...args) => {
	console.log("a user connected");

	connectionHandler(...args);
});

server.listen(3000, () => {
	console.log("listening on *:3000");
});
