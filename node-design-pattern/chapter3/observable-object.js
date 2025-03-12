import { EventEmitter } from "events"
import { readFile, readFileSync } from "fs"

class FindRegex extends EventEmitter {
	constructor (regex) {
		super()
		this.regex = regex
		this.files = []
	}
	
	addFile (file) {
		this.files.push(file)
		return this
	}
	
	findAsync () {
		for (const file of this.files) {
			readFile(file, 'utf-8', (err, content) => {
				if (err) {
					return this.enit('error', err)
				}
				
				this.emit('fileread', file)
				
				const match = content.match(this.regex)
				
				if (match) {
					match.forEach((elemt) => this.emit('found', file, elemt))
				}
			})
		}
		return this
	}
	
	findSync () {
		for (const file of this.files) {
			let content
			try {
				content = readFileSync(file, 'utf-8')
			} catch (err) {
				this.emit('error', err)
			}
			
			this.emit('fileread', file)
			const match = content.match(this.regex)
			if (match) {
				match.forEach((elemt) => this.emit('found', file, elemt))
			}
		}
	}
}

const findRegexInstance = new FindRegex(/hello \w+/)
findRegexInstance
	.addFile('data.txt')
	.addFile('data2.txt')
	.addFile('data3.txt')
	.findAsync()
	.on('fileread', file => console.log(`read the file: ${file}`))
	.on('found', (file, match) => console.log(`Matched "${match}" in file
		${file}`))
	.on('error', err => console.error(`Error emitted ${err.message}`))