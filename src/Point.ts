export class Point {
	constructor(public x: number, public y: number) {}

	public distanceTo(otherLocation: Point) {
		const a = this.x - otherLocation.x;
		const b = this.y - otherLocation.y;
		return Math.hypot(a, b);
	}

	public equals(other: Point): boolean {
		return this.x === other.x && this.y === other.y;
	}

	public toString() {
		return Point.toString(this.x, this.y);
	}

	public static toString(x: number, y: number) {
		return `${x} ${y}`;
	}
}