export default function ticker(tps: number, callback: (delta: number) => void) {
    const interval = 1000 / tps; // Calculate the interval in milliseconds
    let lastTime = performance.now(); // Initialize the lastTime with the current time

    function tick() {
        const now = performance.now();
        const delta = (now - lastTime) / 1000; // Calculate the delta time
        lastTime = now;

        callback(delta);
    }

    // Start the ticking
    setInterval(() => tick(), interval);
}
