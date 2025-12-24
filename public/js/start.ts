import { socket } from "./main.ts";

const startScreenEle = <HTMLDivElement>document.getElementById("start-screen");
const usernameEle = <HTMLInputElement>document.getElementById("username");
const startBtn = <HTMLButtonElement>document.getElementById("start-button");

usernameEle.addEventListener("keydown", ({ key }) => {
    if (key === "Enter") {
        join();
    }
});

startBtn.addEventListener("click", () => join());

function join() {
    socket.emit("join", usernameEle.value);

    startScreenEle.classList.add("hidden");
}
