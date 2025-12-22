import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { Server, type DefaultEventsMap } from "socket.io";
import { Server as Engine } from "@socket.io/bun-engine";
import { init } from "./game.ts";

const port = process.env.PORT ?? 3000;
const isDev = process.env.NODE_ENV === "development";
const app = new Hono();

// Create the Socket IO server
interface SocketData {
    player: any;
}

export const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>();
const engine = new Engine();

// Enable logger in development
if (isDev) app.use("*", logger());

// Serve bundled files
app.get("/*", serveStatic({ root: "dist" }));

// Bind the Socket.IO server to the engine
io.bind(engine);

init();

const { websocket } = engine.handler();

Bun.serve({
    port,
    idleTimeout: 30, // must be greater than the "pingInterval" option of the engine, which defaults to 25 seconds
    development: isDev,

    fetch(req, server) {
        const url = new URL(req.url);

        if (url.pathname === "/socket.io/") {
            return engine.handleRequest(req, server);
        } else {
            return app.fetch(req, server);
        }
    },

    websocket,
});
