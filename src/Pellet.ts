import { Entity } from "./Entity";
import { Location } from "./Location";

export class Pellet extends Entity {
	value: number;

	update(inputs: number[]): void {
		this.location = new Location(inputs[0], inputs[1]);
		this.value = inputs[2];
	}
}