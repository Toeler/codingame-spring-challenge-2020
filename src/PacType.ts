export enum PacType {
	ROCK = 'ROCK',
	PAPER = 'PAPER',
	SCISSORS = 'SCISSORS',
	DEAD = 'DEAD'
};

export namespace PacType {
	export function getLoseTo(type: PacType) {
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

	export function getWinTo(type: PacType) {
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
