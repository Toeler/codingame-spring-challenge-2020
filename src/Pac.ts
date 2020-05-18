import { Entity } from "./Entity";
import { Point } from "./Point";
import { Action } from "./Action";
import { PacType } from "./PacType";

export class Pac extends Entity {
	id: number;
	isCurrentPlayer: boolean;
	typeId: PacType;
	speedTurnsLeft: number;
	abilityCooldown: number;
	previousLocation: Point;
	previousTypeId: PacType;
	previousAge: number;
	previousSpeedTurnsLeft: number;
	previousAbilityCooldown: number;
	
	update(inputs: string[]): void {
		this.id = parseInt(inputs[0]); // (unique within a team)
		this.isCurrentPlayer = inputs[1] !== '0';
		this.previousLocation = this.location;
		this.location = new Point(parseInt(inputs[2]), parseInt(inputs[3]));
		this.previousTypeId = this.typeId;
		this.typeId = <PacType>inputs[4];
		this.previousSpeedTurnsLeft = this.speedTurnsLeft;
		this.speedTurnsLeft = parseInt(inputs[5]);
		this.previousAbilityCooldown = this.abilityCooldown;
		this.abilityCooldown = parseInt(inputs[6]);
		this.previousAge = this.age;
		this.resetAge();
	}

	moveTo(point: Point): Action {
		return Action.Move(this.id, point);
	}

	startSpeed(): Action {
		return Action.Speed(this.id);
	}

	switchType(type: PacType): Action {
		return Action.Switch(this.id, type);
	}
}