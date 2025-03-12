process.env.UV_THREADPOOL_SIZE = 1;
const cluster = require("cluster");

// is the file being in master mode
if (cluster.isMaster) {
	// cause index.js to be executed again 
	// but in child mode
	cluster.fork();
} else {
	// i'm a child that's going to act like a server
	const express = require("express");
	const crypto = require("crypto");
	const app = express();
	
	app.get('/', (req, res) => {
		// executed inside the event loop, not the thread pool or anything.
		crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
			res.send('Hi there');
		});
	});
	
	app.listen(3000, () => {
		console.log("server is live at port 3000");
	});
}