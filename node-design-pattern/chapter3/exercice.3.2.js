import { EventEmitter } from "events";

function ticker(limit, callback) {
	const emitter = new EventEmitter();
	const start = Date.now();
	let ticknumber = 0;

	function repeatingFunc() {
		const elapsed = Date.now() - start;
		if (elapsed < limit) {
			ticknumber += 1;
			emitter.emit("tick");
			setTimeout(repeatingFunc, 50);
		} else {
			callback(ticknumber);
		}
	}

	setTimeout(repeatingFunc, 50);
	
	

	return emitter;
}

function printTicks (ticknumbers) {
	console.log(`the number of ticks was ${ticknumbers}`)
}

ticker(5000, printTicks)
	.on("tick", () => console.log("tick"))