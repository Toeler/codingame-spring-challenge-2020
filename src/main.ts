import { State } from "./State";
import { Timer } from "./Timer";
import { Game } from "./Game";
import { performance } from "perf_hooks";

export function run() {
	const state = new State();

	state.initFromConsole();

	let turn = 0;
	while(true) {
		state.updateScores(); // Read something before we start the turn timer so it is accurate
		const timer = new Timer(`Turn ${++turn}`);
		performance.mark('turn start');
		if (turn === 1) {
			state.initFirstTurnFromConsole();
		} else {
			state.updateFromConsole();
		}

		const actions = new Game().getActions(state);
		timer.stop();
		print(actions.map(action => action.toString()).join('|'));
		state.age();
	}
}
