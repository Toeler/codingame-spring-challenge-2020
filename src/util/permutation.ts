export function* permute<T>(permutation: T[]) {
	const length = permutation.length;
	const c: number[] = Array(length).fill(0);
	let i = 1;
	let k: number;
	let p: T;

	yield permutation.slice();
	while (i < length) {
		if (c[i] < i) {
			k = i % 2 && c[i];
			p = permutation[i];
			permutation[i] = permutation[k];
			permutation[k] = p;
			++c[i];
			i = 1;
			yield permutation.slice();
		} else {
			c[i] = 0;
			++i;
		}
	}
}