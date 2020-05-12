import { Entity } from "./Entity";
import { Point } from "./Point";

const VALUE_MULTIPLIER = 70.0;
const DEAD_END_MULTIPLIER = 1.0;

export class Pellet extends Entity {
	value: number;

	update(location: Point, value: number): void {
		this.location = location;
		this.value = value;
		this.resetAge();
	}

	public getValue(isDeadEnd?: boolean) {
		const value = (343.093 * Math.log(this.value)) + 10;
		const agedValue = Math.max(1, value - this.age);
		return agedValue * (isDeadEnd ? DEAD_END_MULTIPLIER : 1);
	}
}