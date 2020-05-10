import { Entity } from "./Entity";
import { Point } from "./Point";

const DEAD_END_MULTIPLIER = 5.0;

export class Pellet extends Entity {
	value: number;

	update(location: Point, value: number): void {
		this.location = location;
		this.value = value;
		this.resetAge();
	}

	public getValue(isDeadEnd?: boolean) {
		const value = (this.value * 10) - this.age;
		return Math.max(2, value * (isDeadEnd ? DEAD_END_MULTIPLIER : 1));
	}
}