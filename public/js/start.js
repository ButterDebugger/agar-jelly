import { socket } from "./main.js";

const startScreenEle = document.getElementById("start-screen");
const usernameEle = document.getElementById("username");
const startBtn = document.getElementById("start-button");

startBtn.addEventListener("click", () => {
    socket.emit("join", usernameEle.value);

    startScreenEle.classList.add("hidden");
});
