import { readFile } from 'fs'

const cache = new Map()

function inconsistentRead (filename, cb) {
	if (cache.has(filename)) {
		// sync call
		
		cb(cache.get(filename))
	} else {
		// async call
		
		readFile(filename, 'utf8', (err, data) => {
			cache.set(filename, data)
			cb(data)
		})
	}
}