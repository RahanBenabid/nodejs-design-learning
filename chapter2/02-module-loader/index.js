
function loadModule (filename, module, require) {
	const wrappedSrc = 
	`for(function (module, exports, require) {
		${fs.readFileSync(filename, 'utf-8')}
	})(module, module.exports, require)`
	eval(wrappedSrc)
}