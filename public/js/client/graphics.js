import { canvas, ctx } from "../main.js";

const gridSpacing = 100;

export function drawBackground(camera) {
    ctx.fillStyle = "#1d1f25";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Horizontal lines
    for (let y = camera.y % gridSpacing; y < camera.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 10%)";
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.closePath();
    }

    // Vertical lines
    for (let x = camera.x % gridSpacing; x < camera.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 10%)";
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.closePath();
    }
}

export function drawCell(camera, cell) {
    ctx.beginPath();
    ctx.fillStyle = cell.color;
    ctx.arc(camera.x + cell.x, camera.y + cell.y, cell.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}
