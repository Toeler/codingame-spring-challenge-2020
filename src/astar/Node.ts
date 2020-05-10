import { Point } from "../Point";

export class Node {
	#fValue: number;
	get fValue() {
		return this.#fValue;
	}
	#gValue: number;
	get gValue() {
		return this.#gValue;
	}
	set gValue(value) {
		this.#gValue = value;
		this.calculateFValue();
	}
	#hValue: number;
	get hValue() {
		return this.#hValue;
	}
	set hValue(value) {
		this.#hValue = value;
		this.calculateFValue();
	}
	get key() {
		return this.point.toString();
	}
	parent: Node;

	constructor(public point: Point) {}

	public zeroValues() {
		this.#fValue = this.#gValue = this.#hValue = 0;
	}

	private calculateFValue() {
		this.#fValue = this.gValue + this.hValue;
	}
}