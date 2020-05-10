import { State } from "./State";
import { Action } from "./Action";
import { Pellet } from "./Pellet";
import { Point } from "./Point";
import { wrap } from "./util/wrap";
import { findPath } from "./astar/findPath";
import { Timer } from "./Timer";

function getPelletsInRange(center: Point, pellets: Map<string, Pellet>, mapWidth: number, mapHeight: number, distance: number): Pellet[] {
	const result: Pellet[] = [];
	for (let x = wrap(center.x - distance, mapWidth); x !== wrap(center.x + distance, mapWidth); x = wrap(x + 1, mapWidth)) {
		for (let y = wrap(center.y - distance, mapHeight); y !== wrap(center.y + distance, mapHeight); y = wrap(y + 1, mapHeight)) {
			const pellet = pellets.get(new Point(x, y).toString());
			if (pellet) {
				result.push(pellet);
			}
		}
	}
	return result;
}

export class Game {
	public getActions(state: State): Action[] {
		return this.getActions3(state);
		return this.getActions2(state);
	}

	public getActions3(state: State): Action[] {
		let timer = new Timer(`getActions`);
		const actions: Action[] = [];
		for (let pac of state.myPacs.values()) {
			let pacTimer = new Timer(`Pac ${pac.id} turn`);
			let nearbyPellets = getPelletsInRange(pac.location, state.allPellets, state.width, state.height, 10);
			if (!nearbyPellets.length) {
				nearbyPellets = getPelletsInRange(pac.location, state.allPellets, state.width, state.height, 18);
				if (!nearbyPellets.length) {
					printErr(`Could not find any pellets for Pac ${pac.id}`);
				}
			}

			let mostValuableTarget: Pellet;
			let mostValuableScore: number;
			for (let pellet of nearbyPellets) {
				const path = findPath(state.grid, state.width, state.height, state.neighbouringCells, pac.location, pellet.location);
				const score = path.reduce((total, nextPoint) => {
					const cellPellet = state.allPellets.get(nextPoint.toString());
					const cellValue = cellPellet ? cellPellet.getValue() : 0;
					return total - 1 + cellValue;
				}, 0);
				if (!mostValuableScore || score > mostValuableScore) {
					mostValuableScore = score;
					mostValuableTarget = pellet;
				}
			}
			actions.push(pac.moveTo(mostValuableTarget.location));
			pacTimer.stop();
		}
		timer.stop();
		return actions;
	}

	public getActions2(state: State): Action[] {
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
