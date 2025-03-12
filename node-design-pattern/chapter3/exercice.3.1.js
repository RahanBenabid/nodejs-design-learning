import { EventEmitter } from 'events'
import { readFile } from 'fs'

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
	
	find () {
		setImmediate(() => this.emit('process_start', this.files))
		
		for (const file of this.files) {
			readFile(file, 'utf-8', (err, content) => {
				if (err) {
					return this.emit('err', err)
				}
				
				this.emit('fileread', file)
				
				const match = content.match(this.regex)
				if (match) {
					match.forEach(elem => this.emit('found', file, elem))
				}
			})
		}
		return this
	}
}

const myRegex = new FindRegex(/hello/);

myRegex
	.addFile('data.txt')
	.addFile('data2.txt')
	.addFile('data3.txt')
	.addFile('data4.txt')
	.find()
	.on('process_start', files => console.log(`starting to read the files ${files}`))
	.on('err', err => console.log(`error encountered: ${err}`))
	.on('fileread', file => console.log(`read the file ${file}`))
	.on('found', (file, elem) => console.log(`found the element ${elem} in the file ${file}`))