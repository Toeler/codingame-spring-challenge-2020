import { Location } from "./Location";

export abstract class Entity {
	location: Location;

	abstract update(inputs: any[]): void;

	distanceTo(otherEntity: Entity) {
		return this.location.distanceTo(otherEntity.location);
	}
}