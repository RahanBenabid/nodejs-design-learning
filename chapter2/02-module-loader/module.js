const dependency = require("./anotherModule");

// private function
function log() {
	console.log(`Well done ${dependency.username}`);
}

// the API to be exported for the public
module.exports = () => {
	log();
}