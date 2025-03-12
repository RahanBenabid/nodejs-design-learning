import fs from "fs"
import { mockEnable, mockDisable } from "./reassign.js"

mockEnable(Buffer.from('Hello World'))

fs.readFile('fake-path', (err, data) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	console.log(data.toString())
})

mockDisable()