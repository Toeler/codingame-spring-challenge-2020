import { State } from "./State";
import { Action } from "./Action";
import { Pellet } from "./Pellet";

export class Game {
	public getActions(state: State): Action[] {
		const actions: Action[] = [];
		for (let pac of state.myPacs.values()) {
			const highestValues = [...state.allPellets.values()].reduce((highestValues, next) => {
				if (!highestValues.length || highestValues[0].value < next.value) {
					return [next];
				} else if (highestValues[0].value === next.value) {
					highestValues.push(next);
					return highestValues;
				}
				return highestValues;
			}, [] as Pellet[]);
			highestValues.sort((a, b) => {
				return pac.distanceTo(a) - pac.distanceTo(b);
			});
			if (highestValues.length === 0) {
				printErr('Could not find any pellets. allPellets:');
				printErr(state.allPellets);
			}
			actions.push(pac.moveTo(highestValues[0].location));
		}
		return actions;
	}
}
