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
	pastMoves: Action[];

	constructor() {
		super();
		this.pastMoves = [];
	}
	
	update(inputs: string[], location: Point): void {
		this.id = parseInt(inputs[0]); // (unique within a team)
		this.isCurrentPlayer = inputs[1] !== '0';
		this.location = location;
        this.typeId = <PacType>inputs[4];
        this.speedTurnsLeft = parseInt(inputs[5]);
        this.abilityCooldown = parseInt(inputs[6]);
		this.resetAge();
	}

	recordAction(action: Action): Action {
		this.pastMoves.push(action);
		return action;
	}

	moveTo(point: Point): Action {
		return this.recordAction(Action.Move(this.id, point));
	}

	startSpeed(): Action {
		return this.recordAction(Action.Speed(this.id));
	}

	switchType(type: PacType): Action {
		return this.recordAction(Action.Switch(this.id, type));
	}
}