import { Entity } from "./Entity";
import { Point } from "./Point";

const VALUE_MULTIPLIER = 30.0;
const DEAD_END_MULTIPLIER = 5.0;

export class Pellet extends Entity {
	value: number;

	update(location: Point, value: number): void {
		this.location = location;
		this.value = value;
		this.resetAge();
	}

	public getValue(isDeadEnd?: boolean) {
		const value = Math.max(1, (this.value * VALUE_MULTIPLIER) - this.age);
		return value * (isDeadEnd ? DEAD_END_MULTIPLIER : 1);
	}
}