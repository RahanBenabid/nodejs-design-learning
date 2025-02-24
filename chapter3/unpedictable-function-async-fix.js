import { readFile } from "fs";

const cache = new Map()

function consistentReadAsync (filename, callback) {
	if (cache.has(filename)) {
		console.log("cache hit!")
		process.nextTick(() => callback(cache.get(filename)))
	} else {
		console.log("cache miss!")
		readFile(filename, 'utf-8', (err, data) => {
			cache.set(filename, data)
			callback(data)
		})
	}
}

consistentReadAsync(data.txt)