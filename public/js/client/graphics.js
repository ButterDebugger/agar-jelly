import { canvas, ctx } from "../main.js";

export function drawBackground() {
    ctx.fillStyle = "#1d1f25";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawCell(cell) {
    ctx.beginPath();
    ctx.fillStyle = cell.color;
    ctx.arc(cell.x, cell.y, cell.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}
