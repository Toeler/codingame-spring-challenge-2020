import { State } from "./State";
import { Timer } from "./Timer";
import { Game } from "./Game";

function printErrTurnTimes(turnTimes: number[]) {
	let sum = 0;
	let maxTurnTime: number;
	let maxTurn: number;
	for (let [idx, time] of turnTimes.entries()) {
		sum += time;
		if (!maxTurnTime || time > maxTurnTime) {
			maxTurnTime = time;
			maxTurn = idx + 1;
		}
	}
	printErr(`Mean: ${sum / turnTimes.length}ms. Max: Turn ${maxTurn} (${maxTurnTime}ms)`);
}

export function run() {
	const state = new State();

	state.initFromConsole();

	const turnTimes: number[] = [];
	let turn = 0;
	while(true) {
		state.updateScores(); // Read something before we start the turn timer so it is accurate
		const timer = new Timer(`Turn ${++turn}`);
		if (turn === 1) {
			state.initFirstTurnFromConsole();
		} else {
			state.updateFromConsole();
		}

		const actions = new Game().getActions(state);
		timer.stop();
		print(actions.map(action => action.toString()).join('|'));

		state.age();

		//turnTimes.push(timer.stop());
		//printErrTurnTimes(turnTimes);
	}
}
