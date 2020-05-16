export class Point {
	public neighbours: Point[];
	public visiblePoints: Point[]
	
	constructor(public x: number, public y: number) {}

	// Manhattan Distance
	public distanceTo(otherLocation: Point) {
		const x = this.x - otherLocation.x;
		const y = this.y - otherLocation.y;
		return Math.abs(x) + Math.abs(y);
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