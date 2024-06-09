import { ctx } from "../main.js";

const gridSpacing = 100;

export function drawBackground(camera) {
    ctx.fillStyle = "#1d1f25";
    ctx.fillRect(camera.x - camera.offsetX, camera.y - camera.offsetY, camera.width, camera.height);

    let startX = Math.max(-camera.offsetX, camera.x - camera.offsetX);
    let startY = Math.max(-camera.offsetY, camera.y - camera.offsetY);
    let endX = Math.min(camera.world.width - camera.offsetX, camera.x + camera.width - camera.offsetX);
    let endY = Math.min(camera.world.height - camera.offsetY, camera.y + camera.height - camera.offsetY);

    // Horizontal lines
    for (let i = 0; i <= camera.world.height / gridSpacing; i++) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 10%)";
        ctx.moveTo(startX, i * gridSpacing - camera.offsetY);
        ctx.lineTo(endX, i * gridSpacing - camera.offsetY);
        ctx.stroke();
        ctx.closePath();
    }

    // Vertical lines
    for (let i = 0; i <= camera.world.width / gridSpacing; i++) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 10%)";
        ctx.moveTo(i * gridSpacing - camera.offsetX, startY);
        ctx.lineTo(i * gridSpacing - camera.offsetX, endY);
        ctx.stroke();
        ctx.closePath();
    }

    // Border
    ctx.beginPath();
    ctx.strokeStyle = "#9a1b1d";
    ctx.lineWidth = 3;
    ctx.rect(-camera.offsetX, -camera.offsetY, camera.world.width, camera.world.height);
    ctx.stroke();
    ctx.closePath();
}

export function drawBlob(camera, blob) {
    ctx.beginPath();
    ctx.fillStyle = blob.color;
    ctx.arc(blob.x - camera.offsetX, blob.y - camera.offsetY, blob.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}
