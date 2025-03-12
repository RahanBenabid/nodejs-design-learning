const myModule = (() => {
	const privateFoo = () => {}
	const privateBar = []
	
	const exported = {
		publicFoo: () => {},
		publicBar: () => {}
	}
	
	// export only what is meant to be private
	return  exported
})()

console.log(myModule)
console.log(myModule.privateFoo, myModule.privateBar)