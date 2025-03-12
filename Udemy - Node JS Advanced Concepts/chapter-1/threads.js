process.env.UV_THREADPOOL_SIZE = 5;

const crypto = require("crypto");

const start = Date.now();

// these are going to be executed at the same time
crypto.pbkdf2('a', 'b', 10000, 512, 'sha512', () => {
	console.log('1:', Date.now() - start)
});

crypto.pbkdf2('a', 'b', 10000, 512, 'sha512', () => {
	console.log('2:', Date.now() - start)
});

crypto.pbkdf2('a', 'b', 10000, 512, 'sha512', () => {
	console.log('3:', Date.now() - start)
});

crypto.pbkdf2('a', 'b', 10000, 512, 'sha512', () => {
	console.log('4:', Date.now() - start)
});

crypto.pbkdf2('a', 'b', 10000, 512, 'sha512', () => {
	console.log('5:', Date.now() - start)
});

crypto.pbkdf2('a', 'b', 10000, 512, 'sha512', () => {
	console.log('6:', Date.now() - start)
});

/*
* both are about 50ms in execution
* if node was single threaded the second log should have taken 100ms
*/