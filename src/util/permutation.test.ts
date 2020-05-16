import { permute } from "./permutation";

describe('permute', () => {
	it('should return all permutations', () => {
		const array = [1, 2, 3];
		const expected = [
			[1, 2, 3],
			[1, 3, 2],
			[2, 1, 3],
			[2, 3, 1],
			[3, 1, 2],
			[3, 2, 1]
		];

		const permutations = Array.from(permute(array));

		for (const permutation of expected) {
			expect(permutations).toContainEqual(permutation);
		}
		expect(permutations).toHaveLength(expected.length);
	});
});
