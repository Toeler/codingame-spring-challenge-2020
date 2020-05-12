import { readline } from './readline';

declare global {
	namespace NodeJS {
		interface Global {
			readline(): string;
			print(object: any): void;
			printErr(object: any): void;
		} 
	}
}

if (!global.print) {
	global.print = (object: any) => console.log(object);
}
if (!global.printErr) {
	global.printErr = (object: any) => console.error(object);
}
if (!global.readline) {
	global.readline = readline;
}
