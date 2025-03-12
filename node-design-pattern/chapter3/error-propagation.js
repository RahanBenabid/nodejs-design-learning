import { readFile } from "fs";

function readJSON (filename, callback) {
	readFile(filename, 'utf-8', (err, data) => {
		readFile(filename, 'utf-8', (err, data) => {
			let parsed
			if (err) {
				return callback(err)
			}
			
			try {
				parsed = JSON.parse(data)
			} catch (err) {
				return callback(err)
			}
			
			// the first argument (the error) is null to indicate there are not errors
			callback(null, parsed)
		})
	})
}