/*
* This code will not work, it's just a senmi practical example
*/

function createFileReader (filename) {
	const listeners = []
	inconsistentRead(filename, value => {
		listeners.forEach(listener => listener(value))
	})
	
	return {
		onDataReady: listener => listeners.push(listener)
	}
}

console.log(reader1)
reader1.onDataReady(data => {
	console.log(`First call data: ${data}`)
	
	const reader2 = createFileReader('data.txt')
	reader2.onDataReady(data => {
		console.log(`Second call data: ${data}`)
	})
})