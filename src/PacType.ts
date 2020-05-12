export enum PacType {
	ROCK = 'ROCK',
	PAPER = 'PAPER',
	SCISSORS = 'SCISSORS',
	DEAD = 'DEAD'
};

export namespace PacType {
	export function opposite(type: PacType) {
		switch (type) {
			case PacType.ROCK: {
				return PacType.SCISSORS;
			}
			case PacType.PAPER: {
				return PacType.ROCK;
			}
			case PacType.SCISSORS: {
				return PacType.PAPER;
			}
		}
	}
}
