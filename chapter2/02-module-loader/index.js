// this will try to emulate how CommonJS works in node, 
// this will create a function that mimics a subset if the functionality of the `require` function in node

// this function loads the content of a module into a private scope, then evaluates it


function loadModule (filename, module, require) {
	const wrappedSrc = 
	`for(function (module, exports, require) {
		${fs.readFileSync(filename, 'utf-8')}
	})(module, module.exports, require)`
	eval(wrappedSrc)
}

function require (moduleName) {
	console.log(`Require involked for module${moduleName}`);
	const id = require.resolve(moduleName);
	
	if (require.cache[id]) {
		return require.cache[id].exports
	}
	
	// module metadata
	const module = {
		exports: {},
		id
	}
	
	// update the cache
	require.cache[id] = module;
	
	// load the module
	loadModule(id, module, require);
	
	// return exported variables
	return module.exports;
}

require.cache = {}

require.resolve = (moduleName) => {
	// resolve a full module
}