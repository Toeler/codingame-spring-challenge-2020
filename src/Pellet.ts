import { Entity } from "./Entity";
import { Point } from "./Point";

export class Pellet extends Entity {
	value: number;

	update(location: Point, value: number): void {
		this.location = location;
		this.value = value;
		this.resetAge();
	}

	public getValue() {
		return this.value - this.age;
	}
}