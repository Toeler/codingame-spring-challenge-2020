export function readInt(): number {
	return parseInt(readString());
}

export function readInts(): number[] {
	return readStrings().map((val) => parseInt(val));
}

export function readString(): string {
	return readline();
}

export function readStrings(separator: string = ' '): string[] {
	return readString().split(separator);
}
