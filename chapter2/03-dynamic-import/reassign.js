import fs from "fs"

const originalReadFile = fs.readFile
let mockedResponse = null

function mockedReadFile (path, cb) {
	setImmediate(() => {
		cb(null, mockedResponse)
	})
}

export function mockEnable (responseWidth) {
	mockedResponse = responseWidth
	fs.readFile = mockedReadFile
}

export function mockDisable () {
	fs.readFile = originalReadFile
}

function getParamNames(func) {
	const match = func.toString().match(/\(([^)]*)\)/);
	return match ? match[1].split(',').map(param => param.trim()).filter(param => param) : [];
}

console.log(getParamNames(fs.readFile));
mockEnable(15)
console.log(getParamNames(fs.readFile));
mockDisable()
console.log(getParamNames(fs.readFile));