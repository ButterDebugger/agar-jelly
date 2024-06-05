import Cell from "./cell.js";

export default class Player {
    constructor(world, options = {}) {
		Object.defineProperty(this, "world", { value: world });

        this.id = options.id;
        this.name = options.name ?? "Player";
        this.color = options.color ?? "white";
		this.cells = [];

        if (options.cells) {
            for (let cellData of options.cells) {
                this.addCell({
                    id: cellData.id,
                    x: cellData.x,
                    y: cellData.y,
                    mass: cellData.mass
                });
            }
        }
    }

    get isDead() {
        return this.cells.length === 0;
    }
    get isAlive() {
        return !this.isDead;
    }

    // Set the direction of all the cells; NOTE: should be a normalized vector
    setDirection(direction) {
        this.cells.forEach(cell => {
            cell.dir.x = direction.x;
            cell.dir.y = direction.y;
        });
    }

    update() {
        this.cells.forEach(cell => cell.update());
    }

	addCell(options) {
        if (typeof options.id == "string") {
            // Find a cell with a matching id
            let cell = this.cells.find(c => c.id === options.id);

            // If the cell exists, rewrite its properties
            if (cell) {
                if (options.x) cell.x = options.x;
                if (options.y) cell.y = options.y;
                if (options.mass) cell.mass = options.mass;
                if (options.dir) cell.dir = options.dir;

                // Return the existing cell
                return cell;
            }
        }

        // Create a new cell since it doesn't already exist
		let cell = new Cell(this, options);
		this.cells.push(cell);
		return cell;
	}

    // Serialize the data for sending
    serialize() {
        return {
            id: this.id,
            name: this.name,
            cells: this.cells.map(cell => cell.serialize())
        };
    }
}