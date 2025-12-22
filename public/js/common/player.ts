import type { Socket } from "socket.io";
import Cell, { type CellOptions, type SerializedCell } from "./cell.ts";
import type World from "./world.ts";

export const minEjectMass = 20;
export const ejectAmount = 10;
export const minSplitMass = 40;
export const maxSplitCells = 10; // NOTE: never actually used
export const consumeGainPercent = 0.8;
export const consumePercent = 0.85;

export interface PlayerOptions {
    id: string;
    name?: string;
    color?: string;
    cells: CellOptions[];
}

export interface SerializedPlayer {
    id: string;
    name: string;
    color: string;
    cells: SerializedCell[];
}

export default class Player {
    world: World;
    id: string;
    name: string;
    color: string;
    cells: Cell[];
    socket: Socket | undefined;

    constructor(world: World, options: PlayerOptions) {
        this.world = world;
        this.id = options.id;
        this.name = options.name ?? "Player";
        this.color = options.color ?? "white";
        this.cells = [];

        for (let cellData of options.cells) {
            this.addCell(cellData);
        }
    }

    get isDead() {
        return this.cells.length === 0;
    }
    get isAlive() {
        return !this.isDead;
    }

    update(delta: number) {
        this.cells.forEach((cell) => cell.update(delta));
        this.tickPhysics(delta);
    }

    tickPhysics(delta: number) {
        this.cells.forEach((cell) => cell.tickPhysics(delta));
        this.handleStaticCollision(delta);
    }

    // tickPhysics(delta: number) {
    //     this.cells.forEach((cell) => cell.tickPhysics(delta));
    //     this.tickPhysics(delta);
    // }

    // tickPhysics(delta: number) {
    //     this.handleStaticCollision(delta);
    // }

    handleStaticCollision(delta: number) {
        // Apply static collision between the players own cells
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = i + 1; j < this.cells.length; j++) {
                let cell1 = this.cells[i];
                let cell2 = this.cells[j];

                // If the two cells are able to eat each other, do not apply static collision and merge
                if (
                    cell1.mass * consumePercent > cell2.mass ||
                    cell2.mass * consumePercent > cell1.mass
                )
                    continue;

                let dist = Math.sqrt(
                    Math.pow(cell1.x - cell2.x, 2) + Math.pow(cell1.y - cell2.y, 2),
                );

                if (dist < cell1.r + cell2.r) {
                    let angle = Math.atan2(cell1.y - cell2.y, cell1.x - cell2.x);

                    let dir = {
                        x: Math.cos(angle),
                        y: Math.sin(angle),
                    };

                    // Normalize the direction vector
                    let length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
                    dir.x *= 1 / length;
                    dir.y *= 1 / length;

                    // Move the cells apart
                    cell1.x += dir.x * ((cell1.r + cell2.r - dist) / 2) * delta;
                    cell1.y += dir.y * ((cell1.r + cell2.r - dist) / 2) * delta;
                    cell2.x -= dir.x * ((cell1.r + cell2.r - dist) / 2) * delta;
                    cell2.y -= dir.y * ((cell1.r + cell2.r - dist) / 2) * delta;
                }
            }
        }
    }

    addToQuadtree() {
        for (let cell of this.cells) {
            cell.addToQuadtree();
        }
    }

    addCell(options: CellOptions) {
        if (typeof options.id == "string") {
            // Find a cell with a matching id
            let cell = this.cells.find((c) => c.id === options.id);

            // If the cell exists, rewrite its properties
            if (cell) {
                if (options.x) cell.x = options.x;
                if (options.y) cell.y = options.y;
                if (options.mass) cell.mass = options.mass;
                if (options.dir) cell.dir = options.dir;
                if (options.speedMultiplier) cell.speedMultiplier = options.speedMultiplier;

                // Return the existing cell
                return cell;
            }
        }

        // Create a new cell since it doesn't already exist
        let cell = new Cell(this, options);
        this.cells.push(cell);
        return cell;
    }

    getCenter() {
        let sumX = 0;
        let sumY = 0;

        for (let cell of this.cells) {
            sumX += cell.x;
            sumY += cell.y;
        }

        return {
            x: sumX / this.cells.length,
            y: sumY / this.cells.length,
        };
    }

    removeCell(id: string) {
        let index = this.cells.findIndex((c) => c.id === id);
        if (index === -1) return false;

        let cell = this.cells[index];
        this.cells.splice(index, 1);
        this.world.emit("remove_cell", cell);
        return true;
    }

    // Serialize the data for sending
    serialize(): SerializedPlayer {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            cells: this.cells.map((cell) => cell.serialize()),
        };
    }
}
