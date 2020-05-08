export function readInt(): number {
	return parseInt(readString());
}

export function readInts(): number[] {
	return readStrings().map((val) => parseInt(val));
}

export function readString(): string {
	return readline();
}

export function readStrings(): string[] {
	return readline().split(' ');
}

export function readStringLine(): string[] {
	return readline().split('');
}