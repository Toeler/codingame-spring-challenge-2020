import { Point } from "./Point";
import { Graph } from "./Graph";

export function getVisiblePoints(point: Point, graph: Graph): Point[] {
	let neighbours: Point[] = [point];
	let result: Point[] = [];

	while (neighbours.length) {
		let newNeighbours: Point[] = [];
		for (const neighbour of neighbours) {
			newNeighbours = newNeighbours.concat(neighbour.neighbours.filter((nextNeighbour) => (nextNeighbour.x === point.x || nextNeighbour.y === point.y) && nextNeighbour !== point && !result.includes(nextNeighbour)));
		}
		result = result.concat(newNeighbours);
		neighbours = newNeighbours;
	}

	return result;
}