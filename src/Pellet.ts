import { Entity } from "./Entity";
import { Point } from "./Point";

const AGE_MULTIPLIER = 0.9;

export class Pellet extends Entity {
	value: number;

	update(location: Point, value: number): void {
		this.location = location;
		this.value = value;
		this.resetAge();
	}

	public getValue() {
		return this.value * this.value * Math.pow(AGE_MULTIPLIER, this.age);
	}
}