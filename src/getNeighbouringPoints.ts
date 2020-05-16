import { Point } from "./Point";
import { wrap } from "./util/wrap";
import { Graph } from "./Graph";

// Given all possible points (assumed to only be walkable cells) - return those which are adjacent to "point"
export function getNeighbouringPoints(point: Point, graph: Graph, allPoints: Map<string, Point>): Point[] {
	return [
		allPoints.get(Point.toString(point.x, wrap(point.y - 1, graph.height))),
		allPoints.get(Point.toString(point.x, wrap(point.y + 1, graph.height))),
		allPoints.get(Point.toString(wrap(point.x - 1, graph.width), point.y)),
		allPoints.get(Point.toString(wrap(point.x + 1, graph.width), point.y))
	].filter((point) => !!point);
}