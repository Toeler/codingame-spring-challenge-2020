import { Point } from "./Point";

export abstract class Entity {
	location: Point;
	age: number;

	increaseAge() {
		this.age++;
	}

	resetAge() {
		this.age = 0;
	}

	distanceTo(otherEntity: Entity) {
		return this.location.distanceTo(otherEntity.location);
	}
}