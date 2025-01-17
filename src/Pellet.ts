import { Entity } from "./Entity";
import { Point } from "./Point";

const VALUE_MULTIPLIER = 100;
const AGE_MULTIPLIER = 0.9;
const DEAD_END_MULTIPLIER = 1.0;

export class Pellet extends Entity {
	value: number;

	update(location: Point, value: number): void {
		this.location = location;
		this.value = value;
		this.resetAge();
	}

	public getValue(isDeadEnd?: boolean) {
		// const value = (343.093 * Math.log(this.value)) + 10;
		// const agedValue = Math.max(1, value - this.age);
		// return agedValue * (isDeadEnd ? DEAD_END_MULTIPLIER : 1);
		return this.value * VALUE_MULTIPLIER * Math.pow(AGE_MULTIPLIER, this.age) * DEAD_END_MULTIPLIER;
	}
}