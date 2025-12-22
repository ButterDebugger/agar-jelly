import { socket } from "./main.ts";

const startScreenEle = <HTMLDivElement>document.getElementById("start-screen");
const usernameEle = <HTMLInputElement>document.getElementById("username");
const startBtn = <HTMLButtonElement>document.getElementById("start-button");

startBtn.addEventListener("click", () => {
    socket.emit("join", usernameEle.value);

    startScreenEle.classList.add("hidden");
});
