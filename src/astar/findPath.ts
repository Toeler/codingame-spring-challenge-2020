import { BitGrid } from "codingame-js-starter/src/lib/collections/bit-grid";
import { Point } from "../Point";
import { Node } from "./Node";

const MANHATTAN_WEIGHT = 1.0;

function manhattan(start: Point, end: Point) {
	const dx = Math.abs(end.x - start.x);
	const dy = Math.abs(end.y - start.y);

	return (dx * dy) * MANHATTAN_WEIGHT;
}

function getOrAdd<K, V>(map: Map<K, V>, id: K, createFn: () => V): V {
	let result = map.get(id);
	if (!result) {
		result = createFn();
		map.set(id, result);
	}
	return result;
}

function backtrace(node: Node): Point[] {
	const path: Point[] = [];
	let currentNode = node;

	while(currentNode.parent) {
		path.push(currentNode.point);
		currentNode = currentNode.parent;
	}

	return path.reverse();
}

export function findPath(grid: BitGrid, gridWidth: number, gridHeight: number, neighbourLookup: Map<string, Set<Point>>, start: Point, end: Point): Point[] {
	const allList = new Map<string, Node>();
	const closedList = new Set<Node>();
	const openList = new Set([new Node(start)]);

	for (let y = 0; y < gridHeight; y++) {
		for (let x = 0; x < gridWidth; x++) {
			const node = new Node(new Point(x, y));
			if (!grid.get(x, y)) {
				closedList.add(node);
			} else {
				node.hValue = manhattan(node.point, end);
			}
		}
	}

	while (openList.size > 0) {
		const currentNode = [...openList.values()].reduce((lowestFNode, next) => !lowestFNode || next.fValue < lowestFNode.fValue ? next : lowestFNode, null);
		openList.delete(currentNode);
		closedList.add(currentNode);

		if (currentNode.point.equals(end)) {
			return backtrace(currentNode);
		}

		const neighbours = [...neighbourLookup.get(currentNode.key).values()].map((neighbour) => getOrAdd(allList, neighbour.toString(), () => new Node(neighbour)));
		for (let neighbour of neighbours) {
			if (closedList.has(neighbour)) {
				continue;
			}

			const nextGValue = currentNode.gValue + (neighbour.point.x !== currentNode.point.x || neighbour.point.y !== currentNode.point.y ? 1 : 1.41421);

			const isOnOpenList = openList.has(neighbour);
			if (!isOnOpenList || nextGValue < neighbour.gValue) {
				neighbour.gValue = nextGValue;
				neighbour.parent = currentNode;

				openList.add(neighbour);
			}
		}
	}

	return [];
}