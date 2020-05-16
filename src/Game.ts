import { State } from "./State";
import { Action } from "./Action";
import { Pellet } from "./Pellet";
import { Point } from "./Point";
import { wrap } from "./util/wrap";
import { Timer } from "./Timer";
import { Pac } from "./Pac";
import { PacType } from "./PacType";
import { Graph } from "./Graph";
import { debug } from "./util/debug";
import { Node } from "./dijkstra/Node";
import { permute } from "./util/permutation";
import { performance, PerformanceObserver } from "perf_hooks";

const ENEMY_INFLUENCE_RADIUS = 3.0;
const MAX_ENEMY_AGE_INFLUENCE = 10;
const FRIENDLY_PAC_INFLUENCE_RANGE = 7;
const FRIENDLY_PAC_MULTIPLIER = 0.8;
const ENEMY_PAC_INFLUENCE_RANGE = 7;
const ENEMY_PAC_MULTIPLIER = 0.8;

// function getPelletScoreMatrix(emptyMatrix: number[][], allPellets: Map<string, Pellet>, neighbouringCells: Map<string, Set<Point>>, gridWidth: number, gridHeight: number): number[][] {
// 	const matrix: number[][] = emptyMatrix;
// 	for (let y = 0; y < gridHeight; y++) {
// 		for (let x = 0; x < gridWidth; x++) {
// 			if (matrix[y][x] !== -1) {
// 				const pellet = allPellets.get(Point.toString(x, y));
// 				matrix[y][x] = pellet ? pellet.getValue(neighbouringCells.get(pellet.location.toString()).size === 1) : 0;
// 			}
// 		}
// 	}
// 	return matrix;
// }

// function getPacInfluenceMatrix(pac: Pac, state: State, influenceRange: number, multiplier: number): number[][] {
// 	const matrix = state.getInflueceMatrix();

// 	let neighbours = [pac.location];
// 	let seen = [pac.location.toString()];
// 	matrix[pac.location.y][pac.location.x] = 1-multiplier;
// 	const otherPacLocations = [...state.myPacs.values()].filter((otherPac) => otherPac.id !== pac.id).concat([...state.enemyPacs.values()]).map((otherPac) => otherPac.location.toString());
// 	for (let i = 1; i <= influenceRange; i++) {
// 		neighbours = neighbours.reduce((newNeighbours, neighbour) => {
// 			const neighbourNeighbours = [...state.neighbouringCells.get(neighbour.toString())];
// 			return [...newNeighbours, ...neighbourNeighbours.filter((n) => !seen.includes(n.toString()) && !otherPacLocations.includes(n.toString()))];
// 		}, [] as Point[]);

// 		const influenceValue = 1-Math.pow(multiplier, i+1);
// 		for (const neighbour of neighbours) {
// 			matrix[neighbour.y][neighbour.x] = influenceValue;
// 			seen.push(neighbour.toString());
// 		}
// 	}
// 	return matrix;
// }

// function getPacScoreMatrix(pac: Pac, state: State, matrix: number[][], pelletScoreMatrix: number[][], pacInfluenceMatrices: number[][][], currentDepth: number, maxDepth: number, checkedPoints: Set<string>, nextPointsToCheck: Point[]): void {
// 	if (currentDepth >= maxDepth || !nextPointsToCheck.length) {
// 		return;
// 	}

// 	const neighbours = nextPointsToCheck.map((point) => {
// 		const pointNeighbours = state.neighbouringCells.get(point.toString());
// 		return [...pointNeighbours.values()].filter((cell) => !checkedPoints.has(cell.toString()));
// 	}).reduce((flattened, neighbourNeighbours) => [...flattened, ...neighbourNeighbours.filter((neighbour) => flattened.every((n) => !neighbour.equals(n)))], [] as Point[]);

// 	getPacScoreMatrix(pac, state, matrix, pelletScoreMatrix, pacInfluenceMatrices, currentDepth + 1, maxDepth, new Set([...checkedPoints.values(), ...nextPointsToCheck.map((point) => point.toString())]), neighbours);

// 	if (currentDepth !== 0) {
// 		// const enemyPacs = [...state.enemyPacs.values()];
// 		for (const point of nextPointsToCheck) {
// 			const neighbours = [...state.neighbouringCells.get(point.toString()).values()].filter((cell) => !checkedPoints.has(cell.toString()));
// 			const neighbourSum = neighbours.reduce((sum, neighbour) => sum + matrix[neighbour.y][neighbour.x], 0) || 0;
// 			const distanceMultiplier = Math.pow(0.9, currentDepth);
// 			// const enemyInfluenceMultiplier = enemyPacs.reduce((multiplier, enemy) => {
// 			// 	const enemyDistanceToPellet = point.distanceTo(enemy.location);
// 			// 	let distanceModifier: number;
// 			// 	if (enemyDistanceToPellet > 3) {
// 			// 		distanceModifier = 1.0;
// 			// 	} else {
// 			// 		distanceModifier = Math.max(0.2, (0.360674 * Math.log(enemyDistanceToPellet)) + 0.2);
// 			// 		const ageModifier = (1-(Math.min(MAX_ENEMY_AGE_INFLUENCE, enemy.age)/MAX_ENEMY_AGE_INFLUENCE));
// 			// 		distanceModifier = 1 - ((1 - distanceModifier) * ageModifier);
// 			// 		// TODO: Type that beats us should have more influence. Type that we beat should have less.
// 			// 	}
// 			// 	return multiplier *= distanceModifier;
// 			// }, 1.0);
// 			let pelletValueForPac = pelletScoreMatrix[point.y][point.x] * distanceMultiplier;// * enemyInfluenceMultiplier;
// 			matrix[point.y][point.x] = (pelletValueForPac + (neighbourSum / (neighbours.length || 1)));
// 			for (let influenceMatrix of pacInfluenceMatrices) {
// 				// TODO: Don't include influence if they are behind us
// 				// TODO: This can make a Pac get stuck in a corridor as it approaches a friendly pac
// 				matrix[point.y][point.x] = matrix[point.y][point.x] *= influenceMatrix[point.y][point.x];
// 			}
// 		}
// 	} else {
// 		matrix[nextPointsToCheck[0].y][nextPointsToCheck[0].x] = -2;
// 	}
// }

function addPelletValues(graph: Graph<number>, pellets: Pellet[]): void {
	for (const pellet of pellets) {
		graph.set(pellet.location, pellet.getValue());
	}
}

function treatPacsAsWalls(graph: Graph<number>, pacs: Pac[]): void {
	for (const pac of pacs) {
		graph.set(pac.location, -2);
	}
}

function highestValue(graph: Graph<number>, nodes: Node[]): Node {
	return nodes.reduce((highest, node) =>
		!highest || graph.get(node.point) > graph.get(highest.point) ? node : highest
	, null);
}

function shortestDistance(nodes: Node[]): Node {
	return nodes.reduce((highest, node) =>
		!highest || node.distance < highest.distance ? node : highest
	, null);
}

function getPointValue(baseValue: number, distance: number): number {
	return baseValue * Math.pow(0.9, distance);
}

function getPath(graph: Graph<Node>, start: Point, end: Point): Point[] {
	const path: Point[] = [];

	let next = graph.get(end);
	while (next.point !== start) {
		path.push(next.point);
		next = next.previous;
	}
	return path.reverse();
}

function visitNeighbour(neighbour: Point, neighbourDistance: number, prevNode: Node, graph: Graph<Node>, valueGraph: Graph<number>, bonusPoints: number): Node | null {
	const baseValue = valueGraph.get(neighbour);
	if (baseValue < 0) { // Wall
		return;
	}
	const neighbourValue = prevNode.value + getPointValue(baseValue, neighbourDistance) + bonusPoints;
	const currentNeighbour = graph.get(neighbour);
	if (!currentNeighbour) { // First time visiting this node
		const newNode = { distance: neighbourDistance, value: neighbourValue, point: neighbour, previous: prevNode };
		graph.set(neighbour, newNode);
		return newNode;
	} else {
		const currentNeighbourDistance = currentNeighbour.distance;
		if (neighbourDistance < currentNeighbourDistance) {
			currentNeighbour.distance = neighbourDistance;
			currentNeighbour.value = neighbourValue;
			currentNeighbour.previous = prevNode;
		}
		return null;
	}
}

function dijkstra(graph: Graph<Node>, start: Point, valueGraph: Graph<number>, speedTurnsLeft: number) {
	const startNode = { distance: 0, value: 0, point: start, previous: null };
	graph.set(start, startNode);
	const nodesToCheck = new Set<Node>([startNode]);
	const visitedNodes = new Set<Point>();

	while (nodesToCheck.size) {
		const node: Node = shortestDistance(Array.from(nodesToCheck));
		let unvisitedNeighbours = node.point.neighbours.filter((n) => !visitedNodes.has(n));
		const neighbourDistance = node.distance + 1;
		for (const neighbour of unvisitedNeighbours) {
			const newNode = visitNeighbour(neighbour, neighbourDistance, node, graph, valueGraph, 0);
			if (newNode) {
				nodesToCheck.add(newNode);
			}
			if (neighbourDistance <= speedTurnsLeft) {
				const neighboursNeighbours = neighbour.neighbours.filter((n) => !visitedNodes.has(n) && n !== node.point);
				for (const secondNeighbour of neighboursNeighbours) {
					const newNode = visitNeighbour(secondNeighbour, neighbourDistance, node, graph, valueGraph, getPointValue(valueGraph.get(neighbour), neighbourDistance));
					if (newNode) {
						nodesToCheck.add(newNode);
					}
				}
			}
		}
		visitedNodes.add(node.point);
		nodesToCheck.delete(node);
	}

	if (printDebug) {
		debug(graph.toString());
	}

	const destination = Array.from(visitedNodes).reduce((highest, point) =>
		!highest || graph.get(point).value > graph.get(highest).value ? point : highest
	, null);
	
	return getPath(graph, start, destination);
}

let printDebug = false;

export class Game {
	public getActions(state: State): Action[] {
		const timer = new Timer('Get Actions');

		let maximumPermutationTime: number = 0;
		let elapsedTime: number = 0;
		const observer = new PerformanceObserver((list) => {
			const latestEntry = list.getEntries()[0];
			switch (latestEntry.name) {
				case 'permutation time': {
					if (latestEntry.duration > maximumPermutationTime) {
						maximumPermutationTime = latestEntry.duration;
					}
					break;
				}
				case 'turn elapsed': {
					elapsedTime = latestEntry.duration;
					break;
				}
				default: {} // Nothing
			}
		});
		observer.observe({ entryTypes: ['measure'] });

		const masterValueGraph = state.getEmptyGraph();
		addPelletValues(masterValueGraph, state.getPellets());
		treatPacsAsWalls(masterValueGraph, state.getAllPacs());
		if (state.turn > 81) {
			printErr(state.getPellets().map((p) => p.location.toString()));
			printErr(masterValueGraph.toString());
		}
		const permutationOfActions: { permutationNumber: number, score: number, actions: Action[] }[] = [];
		const permutations = state.getPermutationOrder();
		const totalPermutations = [0, 1, 2, 6, 24, 120][state.getMyPacs().length];
		let permutationCount = 0;
		let timeLeftInTurn = Infinity;
		for (const permutation of permutations) {
			timeLeftInTurn = (state.turn === 1 ? 1000 : 50) - elapsedTime - 1; // 1ms buffer
			if (maximumPermutationTime > timeLeftInTurn) {
				break;
			}
			performance.mark('permutation start');
			const pacActions: { score: number, action: Action }[] = [];
			const valueGraph = masterValueGraph.clone();
			for (const pac of permutation) {
				if (pac.abilityCooldown === 0) {
					pacActions.push({ score: 0, action: pac.startSpeed() });
					continue;
				}

				//printDebug = pac.id === 0 && (state.turn === 20 || state.turn === 21);

				const pacGraph = new Graph<Node>(state.width, state.height);
				const bestPath = dijkstra(pacGraph, pac.location, valueGraph, pac.speedTurnsLeft);
				for (const point of bestPath) {
					valueGraph.set(point, 0);
				}
				const destination = bestPath[bestPath.length - 1];
				if (destination) {
					const destinationScore = pacGraph.get(destination).value;
					 debug(`Pac ${pac.id} best path (${destinationScore}): ${bestPath.join(' => ')}`);
					pacActions.push({
						score: destinationScore,
						action: pac.moveTo(bestPath[0])
					});
				} else {
					debug(`Pac ${pac.id} has nowhere to go`);
					pacActions.push({
						score: 0,
						action: pac.moveTo(pac.location)
					});
				}
			}
			permutationOfActions.push({
				permutationNumber: permutationCount++,
				score: pacActions.reduce((sum, x) => sum + x.score, 0),
				actions: pacActions.map((x) => x.action)
			});
			performance.mark('permutation end');
			performance.measure('permutation time', 'permutation start', 'permutation end');
			performance.measure('turn elapsed', 'turn start', 'permutation end');
		}
		debug(`Completed ${permutationCount}/${totalPermutations} permutations, ${timeLeftInTurn}ms remaining. Longest permutation took ${maximumPermutationTime}ms.`);

		permutationOfActions.sort((a, b) => b.score - a.score);
		const newPermutationOrder = permutationOfActions.map((x) => x.permutationNumber);
		const newPermutation = newPermutationOrder.reduce((arr, next) => {
			arr.push(permutations[next]);
			return arr;
		}, [] as Pac[][]);
		permutations.filter((permutation, idx) => {
			if (!newPermutationOrder.includes(idx)) {
				newPermutation.push(permutation);
			}
		});
		state.setPermutationOrder(newPermutation);

		let bestPermutation = permutationOfActions[0];
		// debug(`Best set of actions (${bestPermutation.score})`);
		observer.disconnect();
		timer.stop();

		return bestPermutation.actions;
	}
	// public getActions(state: State): Action[] {
	// 	const timer = new Timer(`getActions`);

	// 	const pelletMatrix = getPelletScoreMatrix(state.getGridMatrix(), state.allPellets, state.neighbouringCells, state.width, state.height);
	// 	const myPacInfluenceMatrices: Map<number, number[][]> = new Map();
	// 	const enemyPacInfluenceMatrices: Map<Pac, number[][]> = new Map();
	// 	for (const pac of state.myPacs.values()) {
	// 		myPacInfluenceMatrices.set(pac.id, getPacInfluenceMatrix(pac, state, FRIENDLY_PAC_INFLUENCE_RANGE, FRIENDLY_PAC_MULTIPLIER));
	// 	}
	// 	for (const enemy of state.enemyPacs.values()) {
	// 		enemyPacInfluenceMatrices.set(enemy, getPacInfluenceMatrix(enemy, state, ENEMY_PAC_INFLUENCE_RANGE, ENEMY_PAC_MULTIPLIER));
	// 	}

	// 	const enemyPacs = [...state.enemyPacs.values()];
	// 	const pacMatrices: { id: number, matrix: number[][]}[] = [];
	// 	const actions: Action[] = [];
	// 	for (let pac of state.myPacs.values()) {
	// 		const pacTimer = new Timer(`Pac ${pac.id} turn`);

	// 		let neighbours: Point[] = [...state.neighbouringCells.get(pac.location.toString()).values()];
	// 		let nearbyEnemies: Pac[] = enemyPacs.filter((enemy) => neighbours.some((point) => point.equals(enemy.location)));
	// 		if (pac.abilityCooldown === 0) {
	// 			if (nearbyEnemies.length) {
	// 				// TODO: handle more than 1 nearby enemy
	// 				printErr(`${nearbyEnemies.length} nearby enemies`);
	// 				switch (nearbyEnemies[0].typeId) {
	// 					case PacType.getLoseTo(pac.typeId): {
	// 						actions.push(pac.switchType(PacType.getLoseTo(nearbyEnemies[0].typeId)));
	// 						break;
	// 					}
	// 					case pac.typeId: {
	// 						actions.push(pac.switchType(PacType.getLoseTo(nearbyEnemies[0].typeId)));
	// 						break;
	// 					}
	// 					default: { // We win
	// 						printErr(`Eat enemy ${nearbyEnemies[0].id}`);
	// 						actions.push(pac.moveTo(nearbyEnemies[0].location));
	// 					}
	// 				}
	// 			} else {
	// 				actions.push(pac.startSpeed());
	// 			}
	// 		} else {
	// 			const pacMatrix: number[][] = state.getGridMatrix();
	// 			const NUMBER_TURNS_TO_CONSIDER = 30;
	// 			const checkedCells = new Set<string>();
	// 			// TODO: Treat different enemy types differently
	// 			const otherPacInfluence = [...myPacInfluenceMatrices].filter(([pacId]) => pacId !== pac.id).map(([_, matrix]) => matrix).concat([...enemyPacInfluenceMatrices.values()]);
	// 			// const pacScoreTimer = new Timer(`Pac ${pac.id} Score Matrix`);
	// 			getPacScoreMatrix(pac, state, pacMatrix, pelletMatrix, otherPacInfluence, 0, NUMBER_TURNS_TO_CONSIDER, checkedCells, [pac.location]);
	// 			// pacScoreTimer.stop();
	// 			pacMatrices.push({ id: pac.id, matrix: pacMatrix });

	// 			let highestValueDirection: Point;
	// 			let action: Action = pac.moveTo(pac.location);
	// 			if (pac.speedTurnsLeft > 0) {
	// 				// We're moving 2 spaces
	// 				// TODO: Move this up out of the else so we can attack 2 spaces
	// 				neighbours = neighbours.map((neighbour) => {
	// 					// TODO: This needs improvement, it just doesn't even consider the space where an enemy is
	// 					const nextNeighbours = [...state.neighbouringCells.get(neighbour.toString())].filter((nextNeighbour) => !nextNeighbour.equals(pac.location) && enemyPacs.every((enemy) => !nextNeighbour.equals(enemy.location)));
	// 					if (nextNeighbours.length === 0) {
	// 						// Dead-end, so include this single-step move
	// 						return [neighbour];
	// 					}
	// 					for (const nextNeighbour of nextNeighbours) {
	// 						// If we are movng through a point to another, then the second point should include the value of the one we pass through
	// 						pacMatrix[nextNeighbour.y][nextNeighbour.x] += pelletMatrix[neighbour.y][neighbour.x];
	// 						//pacMatrix[nextNeighbour.y][nextNeighbour.x] += pacMatrix[neighbour.y][neighbour.x];
	// 					}
	// 					return nextNeighbours;
	// 				}).reduce((allNeighbours, neighbour) => [...allNeighbours, ...neighbour.values()], [] as Point[]);
	// 			}
	// 			// const pacDirectionTimer = new Timer(`Pac ${pac.id} Direction Selection`);
	// 			for (let neighbour of neighbours) {
	// 				const neighbourValue = pacMatrix[neighbour.y][neighbour.x];
	// 				if (!highestValueDirection || neighbourValue > pacMatrix[highestValueDirection.y][highestValueDirection.x]) {
	// 					// TODO: Handle crossing paths with our own pac. This only checks moving 1 tile at a time
	// 					const newAction = pac.moveTo(neighbour);
	// 					if (actions.every((otherPacAction) => !newAction.equalTo(otherPacAction))) {
	// 						highestValueDirection = neighbour;
	// 						action = newAction;
	// 					}
	// 				}
	// 			}
	// 			// pacDirectionTimer.stop();
	// 			actions.push(action);
	// 		}
	// 		pacTimer.stop();
	// 	}
	// 	timer.stop();

	// 	// debug(`Pellet Value Graph: ${Buffer.from(JSON.stringify(pelletMatrix)).toString('base64')}`);
	// 	for (const matrix of pacMatrices) {
	// 		if (matrix.id !== 2 || state.turn < 12) {
	// 			continue;
	// 		}
	// 		// const pac2 = state.myPacs.get(2);
	// 		// if (pac2.location.x !== 13 && pac2.location.y !== 9 && pac2.location.y !== 10) {
	// 		// 	continue;
	// 		// }
	// 		// printErr(`Pellet Value Graph: ${Buffer.from(JSON.stringify(pelletMatrix)).toString('base64')}`);
	// 		printErr(`Pac ${matrix.id} Value Graph: ${Buffer.from(JSON.stringify(matrix.matrix.map((row) => row.map((cell) => cell.toFixed(0))))).toString('base64')}`);
	// 		// printErr(`Pac Influence Graph: ${Buffer.from(JSON.stringify(myPacInfluenceMatrices.get(1).map((row) => row.map((cell) => cell)))).toString('base64')}`);
	// 		// printErr(`Pac Influence Graph: ${Buffer.from(JSON.stringify(enemyPacInfluenceMatrices.get(state.enemyPacs.get(1)).map((row) => row.map((cell) => cell)))).toString('base64')}`);
	// 	}


	// 	return actions;
	// }
}
