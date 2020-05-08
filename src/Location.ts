export class Location {
	constructor(public x: number, public y: number) {}

	public distanceTo(otherLocation: Location) {
		const a = this.x - otherLocation.x;
		const b = this.y - otherLocation.y;
		return Math.hypot(a, b);
	}
}