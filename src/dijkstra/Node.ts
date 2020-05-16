import { Point } from "../Point";

export interface Node {
	distance: number;
	value: number;
	point: Point;
	prev: Node | null;
}
