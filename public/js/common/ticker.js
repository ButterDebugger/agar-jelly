export default function ticker(tps, callback) {
    const interval = 1000 / tps; // Calculate the interval in milliseconds
    let lastTime = performance.now(); // Initialize the lastTime with the current time

    function tick() {
        const now = performance.now();
        const delta = (now - lastTime) / interval; // Calculate the delta time
        lastTime = now;

        callback(delta);

        setTimeout(tick, interval); // Schedule the next tick
    }

    tick(); // Start the ticking
}
