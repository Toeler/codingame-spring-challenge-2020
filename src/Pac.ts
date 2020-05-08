import { Entity } from "./Entity";
import { Location } from "./Location";

export class Pac extends Entity {
	id: number;
	isCurrentPlayer: boolean;
	typeId: string;
	speedTurnsLeft: number;
	abilityCooldown: number;
	
	update(inputs: string[]): void {
		this.id = parseInt(inputs[0]); // (unique within a team)
		this.isCurrentPlayer = inputs[1] !== '0';
		this.location = new Location(parseInt(inputs[2]), parseInt(inputs[3]));
        this.typeId = inputs[4];
        this.speedTurnsLeft = parseInt(inputs[5]);
        this.abilityCooldown = parseInt(inputs[6]);
	}

	moveTo(entity: Entity): string {
		return `MOVE ${this.id} ${entity.location.x} ${entity.location.y}`;
	}
}