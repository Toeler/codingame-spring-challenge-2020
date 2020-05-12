import { ActionType } from "./ActionType";
import { Point } from "./Point";
import { PacType } from "./PacType";

export class Action {
	constructor(public type: ActionType, public pacId: number, public action: string) {}

	public toString(): string {
		return `${this.type} ${this.pacId} ${this.action}`;
	}

	public static Move(pacId: number, point: Point): Action {
		return new Action(ActionType.Move, pacId, point.toString());
	}

	public static Speed(pacId: number): Action {
		return new Action(ActionType.Speed, pacId, '');
	}

	public static Switch(pacId: number, type: PacType): Action {
		return new Action(ActionType.Switch, pacId, type);
	}

	public equalTo(otherAction: Action) {
		return this.type === otherAction.type && this.action === otherAction.action;
	}
}