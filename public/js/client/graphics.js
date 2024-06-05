import { canvas, ctx } from "../main.js";

const gridSpacing = 100;

export function drawBackground(camera) {
    ctx.fillStyle = "#1d1f25";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let startX = Math.max(-camera.x, 0);
    let startY = Math.max(-camera.y, 0);
    let maxWidth = Math.min(camera.world.width, camera.width + camera.x) - camera.x;
    let maxHeight = Math.min(camera.world.height, camera.height + camera.y) - camera.y;

    // Horizontal lines
    for (let y = -camera.y; y <= maxHeight; y += gridSpacing) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 10%)";
        ctx.moveTo(startX, y);
        ctx.lineTo(maxWidth, y);
        ctx.stroke();
        ctx.closePath();
    }

    // Vertical lines
    for (let x = -camera.x; x <= maxWidth; x += gridSpacing) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 10%)";
        ctx.moveTo(x, startY);
        ctx.lineTo(x, maxHeight);
        ctx.stroke();
        ctx.closePath();
    }

    // Border
    ctx.beginPath();
    ctx.strokeStyle = "#9a1b1d";
    ctx.lineWidth = 3;
    ctx.rect(-camera.x, -camera.y, camera.world.width, camera.world.height);
    ctx.stroke();
    ctx.closePath();
}

export function drawBlob(camera, blob) {
    ctx.beginPath();
    ctx.fillStyle = blob.color;
    ctx.arc(blob.x - camera.x, blob.y - camera.y, blob.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}
