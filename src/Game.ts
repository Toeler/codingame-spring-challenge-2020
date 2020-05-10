import { State } from "./State";
import { Action } from "./Action";
import { Pellet } from "./Pellet";
import { Point } from "./Point";
import { wrap } from "./util/wrap";
import { findPath } from "./astar/findPath";
import { Timer } from "./Timer";
import { debug } from "./util/debug";

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

function getPelletScoreMatrix(allPellets: Map<string, Pellet>, neighbouringCells: Map<string, Set<Point>>, gridWidth: number, gridHeight: number): number[][] {
	const matrix: number[][] = [];
	for (let y = 0; y < gridHeight; y++) {
		matrix[y] = [];
		for (let x = 0; x < gridWidth; x++) {
			const pellet = allPellets.get(Point.toString(x, y));
			matrix[y][x] = pellet ? pellet.getValue(neighbouringCells.get(pellet.location.toString()).size === 1) : 0;
		}
	}
	return matrix;
}

export class Game {
	public getActions(state: State): Action[] {
		let timer = new Timer(`getActions`);

		const matrix = getPelletScoreMatrix(state.allPellets, state.neighbouringCells, state.width, state.height);
		debug(`Pellet Value Graph: ${Buffer.from(JSON.stringify(matrix)).toString('base64')}`);

		const actions: Action[] = [];
		for (let pac of state.myPacs.values()) {
			let pacTimer = new Timer(`Pac ${pac.id} turn`);
			let nearbyPellets = getPelletsInRange(pac.location, state.allPellets, state.width, state.height, 10);
			if (!nearbyPellets.length) {
				nearbyPellets = getPelletsInRange(pac.location, state.allPellets, state.width, state.height, 18);
				if (!nearbyPellets.length) {
					debug(`Could not find any pellets for Pac ${pac.id}`);
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
}
