import { World } from "./World";
import { readInts, readInt, readStrings } from "./util";
import { Pac } from "./Pac";
import { Pellet } from "./Pellet";

export function run() {
	const world = new World();

	world.initFromConsole();

	while(true) {
		const [myScore, opponentScore] = readInts();
		const pacs: Pac[] = [];
		const pellets: Pellet[] = [];

		const visiblePacCount = readInt();
		for (let i = 0; i < visiblePacCount; i++) {
			const pac = pacs[i] || (pacs[i] = new Pac());
			pac.update(readStrings());
		}

		const visiblePelletCount = readInt();
		for (let i = 0; i < visiblePelletCount; i++) {
			const pellet = pellets[i] || (pellets[i] = new Pellet());
			pellet.update(readInts());
		}

		const myPacs = pacs.filter((pac) => pac.isCurrentPlayer);
		let moves: string[] = [];
		for (let pac of myPacs) {
			const highestValues = pellets.reduce((highestValues, next) => {
				if (!highestValues.length || highestValues[0].value < next.value) {
					return [next];
				} else if (highestValues[0].value === next.value) {
					highestValues.push(next);
					return highestValues;
				}
			}, [] as Pellet[]);
			highestValues.sort((a, b) => {
				return pac.distanceTo(a) - pac.distanceTo(b);
			});
			if (highestValues.length === 0) {
				printErr('Could not find any pellets');
			}
			moves.push(pac.moveTo(highestValues[0]));
		}
		print(moves.join('|'));
	}
}
