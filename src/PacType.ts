export enum PacType {
	ROCK = 'ROCK',
	PAPER = 'PAPER',
	SCISSORS = 'SCISSORS',
	DEAD = 'DEAD'
};

export namespace PacType {
	export function getCounter(type: PacType) {
		switch (type) {
			case PacType.ROCK: {
				return PacType.PAPER;
			}
			case PacType.PAPER: {
				return PacType.SCISSORS;
			}
			case PacType.SCISSORS: {
				return PacType.ROCK;
			}
		}
	}
}
