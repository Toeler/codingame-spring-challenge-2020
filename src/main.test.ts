import { run } from "./main";
import { Location } from "./Location";

describe("run", () => {
	it("should be a function", () => {
		expect(typeof run).toBe("function");
	});
});

describe('distance sorting', () => {
	it('should sort correctly when using location.distanceTo()', () => {
		const locations = [
			new Location(0, 0),
			new Location(0, 1),
			new Location(3, 3),
			new Location(6, 1),
			new Location(1, 9)
		];
		const center = new Location()
	})
});