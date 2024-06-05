import Cell from "./cell.js";

export default class Player {
    constructor(world, options = {}) {
		Object.defineProperty(this, "world", { value: world });

        this.id = options.id;
        this.name = options.name ?? "Player";
        this.color = options.color ?? "white";
		this.cells = [];
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