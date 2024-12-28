exports.hello = () => {
	console.log("Hello");
}

// this is wrong
exports = () => {
	console.log("Hello");
}

module.exports = () => {
	console.log("Hello");
}