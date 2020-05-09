import { ActionType } from "./ActionType";
import { Point } from "./Point";

export class Action {
	constructor(public type: ActionType, public pacId: number, public action: string) {}

	public toString(): string {
		return `${this.type} ${this.pacId} ${this.action}`;
	}

	public static Move(pacId: number, point: Point): Action {
		return new Action(ActionType.Move, pacId, point.toString());
	}
}