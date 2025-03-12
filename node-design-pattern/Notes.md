# My Personal Notes About NodeJS, Feel Free To Read
These are my personal notes, but since the repo is public, I have considered the one in a bajillionth chance that someone might want to read this, and made the notes as understandable as possible.

# Some NodeJS Talk Before We Really Start
This will cover some aspects of I/O operations in general, and how NodeJS relates to everything.

NodeJS is single threaded, which means it has an asynchronous architecture, this will give us advantages in scalability and performance, and it simplifies many complex topics like concurrency and paralellism, and replaces them with easier counterparts, for example threads are replaced by callbacks. While keeping things powerful and flexible.

One of the most important design patterns of node is the asynchronous nature, which takes advantage of callbacks and promises.

NodeJS is a minimal runtime, it has the minimal set of functionalities and leaves the rest to the **Userspace**, contrary to other frameworks that work as an **All In One**, node leaves space to community to experiment and find their own way. It has *Modules* that ‌aim to do one thing and do it do it well, it helps with the code size and scope. making use of *npm* and *yarn* to manage dependencies hell. By that, it means two or more packages dependinf on the same package with different versions of that package are will use their own installation to avoid conflict, this enables **reusability**, Node heavily emphasizes on the *DRY* principle *(Don’t Repeat Yourself)*.

The modules are also focused on being used rather than being extended, thus helping reducing use cases, simplifying the implementions and maintenance.

The opposite of **Simple** is **Perfect** and Node emphasizes on the former, and JavaScript helps in doing that with its pragmatic language.

# Inside NodeJS

## I/O
When operating in  computer, the slowest operation is the I/O one, it depends on many things like the RAM speed and Hard Disk speed, this can be problematic since in traditional blocking I/O programs, the function calling the I/O will block the execution of thread until the operation completes, these can be an issue when dealing with Read/Write operation as they take time, it’s something like this in real code:

```js
// block the thread until data is available
data = socket.read()
// data available
print(data)
```

When creating a web server that uses this architecture, it won’t be able to handle many requests, since each requested I/O operation will block any other connection, the solution is to create a thread to handle each connection. But this approch is not efficient as a thread is usually expensive in ressources, having it run constantly for each request, just for it to stay **IDLE** most of the time is not ideal.

The solution here is to use something called the *Busy-Waiting*, which is by actively polling the resouce within a loop until the data is returned, here is an explanation in code:

```js
resources = [socketA, socketB, fileA]
// keep looping while there are resources available
while (!resources.isEmpty()) { 
	for (resource of resources) {
		// try to read
		data = resource.read()
		if (data === NO_DATA_AVAILABLE) {
			// no data to read for now
			continue
		}
		if (data === RESOURCE_CLOSED) {
			// resource closed remove it from the list
			resources.remove(i)
		} else {
			// data received, process it
			consumeData(data)
		}
	}
}
```

This is also inneficient however, since it will consume a lot of **CPU** constantly, and that is some wasted power.

There is also the *Demultiplexting* algorithm, which routes incoming data from manu sources to the right destination, the advantage us that it blocks until new events are available for processing, being pretty efficient, here is another pseudo-code for better clarity:

```js
// set for monitoring, in here, we add the resource and associate it with an operation
watchedList.add(socketA, FOR_READ)
watchedList.add(fileB, FOR_READ)
while (events = demulteplexer.watch(watchedList)) {
	for (event of events) {
		data = even.resouces.read()
		if (data === RESOURCE_CLOSED) {
			demutiplexer.unwatch(event.resouce)
		} else {
			consumeData(data)
		}
	}
}
```

The program continuously checks for events, reads data when available, handles closed resources appropriately, and processes any received data.
Now using this pattern, we can handle several I/O operations inside a single thread, unlike the *Busy-Waiting* technique that uses a a thread for each I/O. So here, using a single thread, we can be effiecient when dealing with multiple resources, since the tasks are spread over time.

```txt
          ┌───────────────┐          
          │ Connection A, │          
          │     B, C      │          
          └───────┬───────┘          
                  │                  
                  │                  
                  │                  
                  ▼                  
             ┌─────────┐             
             │ Server  │             
             └────┬────┘             
                  │                  
                  ▼                  
┌───────────────────────────────────┐
│              Thread               │
│  +-----------------------------+  │
│  |  Idle Time                  |  │
│  +-----------------------------+  │
│  |  Handle Data from A         |  │
│  +-----------------------------+  │
│  |  Idle Time                  |  │
│  +-----------------------------+  │
│  |  Handle Data from B         |  │
│  +-----------------------------+  │
│  |  Idle Time                  |  │
│  +-----------------------------+  │
│  |  Handle Data from C         |  │
│  +-----------------------------+  │
│  |  Idle Time                  |  │
│  +-----------------------------+  │
│                                   │
└───────────────────────────────────┘
```

instead of being spead over multiple threads, the data is spread over time.

The **Reactor Pattern** is a fundamental part of Node.js’ asynchronous, event-driven architecture. It is responsible for handling I/O operations efficiently using an event loop.

How the Reactor Pattern Works in Node.js:
	1.	Event Demultiplexer (libuv): It listens for I/O events (network requests, file operations, timers).
	2.	Event Queue: Incoming requests (events) are placed in a queue.
	3.	Event Loop: The loop continuously checks the queue and dispatches events to corresponding callback functions.
	4.	Worker Threads (when needed): If a task is CPU-intensive, it may be offloaded to a worker thread.
	5.	Callback Execution: Once an operation is completed, its callback is executed.

Meanwhile, there is the more advanced *Reactor Pattern*, which takes advantage of handlers associated with each I/O, those handlers being a callback in NodeJS. Here is the loop being followed by this pattern:
1. the app generates a new I/O operation, it submits a request to the **Event Demultiplexer** (Resource, Operation, Handler), and it specifies the handler (it will be invoked when the operation completes), this is a non-blocking call and it instantly returns control to the app
2. After a set of I/O operations is complete, the Event Demultiplexer pushes the set into an **Event Queue**
3. The **Event Loop** iterates over them one by one, and for each one of them, the *handler* associated with it is called
4. the handler then gives back control to the Even Loop when its execution completes, while the handler is being executed, it can request new asynchronous operations, causing new items to be added to the Event Demultiplexer, which is the first list we talked about
5. When the items in the *Event Queue* are processed, the even *Event Loop* blocks yet again all the *Event Demultiplexer*, which triggers another cycle when a new event is available

The idea here is that the application want to access a resource at one point, it does that without blocking when will provide a handler, and that handler will be invoked at some point when the operation finishes.

Same for *NodeJS* it **does** indeed use a *Reactor Pattern*, this allows the app to continue processing other tasks while waiting for I/O operations to finish.
Note that the app will exit when there are no more pending operations in the event demultiplexer, and no events inside the event queue.

> For short the reactor pattern handles I/O by blocking until new events are available, and reacts to them by dispatching each event to their associated handler

### Libuv
This stupid name refers to the native NodeJS library, *libuv* takes care of the inconsistencies across different OSs and how they manage demultiplexing, and makes NodeJS compatible with all these major OS to normalize the non-blocking behaviour, check the [Nikil Marathe](nodejsdp.link/uvbook) book for more infos.

## NodeJS Components & More About NodeJS
After what we’ve seen, in *libuv*, there are a few more components that are pretty much the Core of NodeJS, here they are:
- libuv (seen before)
- *V8*, the Javascript engine, made by *Google* and used by *Google Chrome*, thanks to it, NodeJS is fast and efficient in memory management.
- A *Core JavaScript Library* which implements all the high-level NodeJS API
- a *Set of Bindings*, which they wrap and expose libuv and other low-level JavaScript functionalities

We need to note that the JavaScript we use in Node is **different** from the JavaScript in browsers, for example, in Node, we don’t have a **DOM**, same for documents and windows, however, in JavaScript, we don’t have access to services the operating system offers, quite the opposite, browser need to make sure that the operating system is not **compromised** by web application, meanwhile Node has virtual access to all these services and resources.

There is a whole deal with **module systems** in Node, it has two, *CommonJS* and *ECMAScript Modules*, CommonJS being the older and traditional one, used for server side JavaScript, meanwhile ECMAScript is a modern alternative that has many advantages, however it is not supported in older versions of Node.js (prior to 12) natively, each one has its own drawbacks and advantages.
*CommonJS* is a module system that has uses the `require` keyword to import functions, it allowed devs to create large and better organized apps. But nowadays, JavaScript has the so called ES modules that use the `import` keyword instead.

Not being executed inside the browser is a big deal and a game changer, for example, we have the `fs` module which helps us read/write files. We can write apps that use the *TCP* or *UDP* sockets, using the `dgram` module, encrypt and use hashing algorithms using the `crypt` module, get environment variables using `process.env` and much more…

An intersting thing, and certainly very useful about Node, is creating **userland modules**, which they can bind to native code which allows to reuse exising code and components written in code like *C++* thanks to the *N-API* interface. And allows executing code even faster than the *V8* engine. 

Summary:
1. NodeJS genralities, the core and all
2. different I/O handling Reactor pattern
3. NodeJS architecture and components

# Chapter 2
# The Module System In NodeJS
Like stated before, NodeJS comes with two different module systems, CJS and ES Modules, we’re going to dive deeper into them, and answer when to use one and not the other.

First off, modules are needed in a plethora of things, most notably **splitting the codebase**, to make the code more organized, and making it independent and easier to maintain, code reuse is also helpful, features can be reused across different projects, implementation complexity is hidden, you only have clear responsiblities and interfaces, and of course, most notably, is the dependecy management.

There is a difference between a module and a module system, the module is the unit of the software, and the latter is syntax and tooling that allow us to define and use it.

Before node, there was no mudule system, and instead, people just imported the JavaScript code using the `<script/>` tag, but as the web became more complex, it was no longer a good option, the idea was not to rely on the HTML tag, instead, it was to rely on purely JavaScript and files available in the local filesystem. This is where *CommmonJS* comes to play, its goal was to provide a module system in a **serverless environment**.
It was the standard for years until *ESM* came along, and provided several innovative ideas, and as the years pass, it is more and more likely for it to become the standard instead of *CommonJS*. 
So while learning CJS is fine, it’s better to focus in ESM from now on.

Some issues with JavaScript is the lack of namespaces, every script runs on the global scope, like imagine, a third party library instantiates a variable called `utils`, this will cause a crash in case any other library or the app code overrides it.

To avoid that we use a technique called the *revealing module pattern*, seen in the repo code in `/chapter2`, which uses **IIFE** to ceate a private scope, and exports the only parts that are meant to be public.
In here the `myModule` variable contains only the exported API, and the rest of it is inaccessible from the outside. from seeing the log:

```sh
{ publicFoo: [Function: publicFoo],
	publicBar: [Function: publicBar] }
undefined undefined
```

we understand that only the exported properties are directly accessible.

## More About CommmonJS
Built originally into NodeJS, it has CommonJS specification:
- the `require` function, it allows you to import moducles from the local filesystem
- the `exports` and `module.exports` that are used to export public functionalities from the current module

### the require function:
here is a simple step by step on how the `require()` function in node genreally works:
1. we accept a module as a parameter, we resolve the full path of that module, we’ll call that the `id`.
2. if it was already loaded in the past, then it should be available in the cache, so we return in immediately
3. if it hasn’t been loaded yet, we setup the environment for the first load, by that, we create a `module` object that contains an `exports` property initilized with an empty object literal, which will be populated by the code of the module ti export its **Public API**
4. then we cache the module after the load
5. we read the module source code from its file and evaluate the code
6. the content of the `module.exports`, which represents the public API of the module, is returned…

It’s important to remember that everything inside a function is private untill it’s assigned to the `module.exports` variable, which is a special varialble. The content of this varible is cached and then returned when the module is loaded using the `require()`.

## `module.exports` vs `exports`
I’ve met these two a lot, but don’t really know the difference, both are used to *expose* a public API.

> we use `module.exports` when there is only *one item* we need to export, and `exports` is used for many exports.

The `module` is a plain JS object representing the current module, it’s local to each to each module and it’s also *private*.

If we want to export a single *class/variable/function* from one module to another, we use `module.exports`

for example:

```js
// EXPORT
class RandomClass {
	constructor() {}
	
	method() { return something }
}

module.exports = RandomClass;

// IMPORT
const RandomClass = require("./myclass.js")
```

meanwhile here is how we use the `exports`:

```js
// EXPORT
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
exports.multiply = (a, b) => a * b;

// IMPORT
const Arithmetic = require("./calculator.js");

console.log(`Addition -> ${Arithmetic.add(100, 40)}`);
console.log(`subtraction -> ${Arithmetic.subtract(100, 40)}`);
```

Reassigning the exports variable doesn’t have any effect because it doesn’t change the content of `module.exports` it will only reassign the variable itself. So the following code won’t work

```js
exports = () => {
	console.log("hello");
}
```

One thing to note is that the `require` function is *synchronous*, it only returns the module contents directly without using any callback. So any issignments to it must be synchronous…

## How NodeJS Searches Your Packages
Here is how Node resolves imports using its algorithm:
- if the `moduleName` inside the `require` starts with `/`, then it’s aready considered an obsolute path, while `./` is considered a relative path
- if it’s not prefixed with `/` then node will try looking in its **core Node.js modules**, the pre-installed node modules
- if there is mo match, then it will start looking inside the `/node_modules` directory in the root of the project, if there is no match still, it will still try to match into the next `/node_modules` until it reaches the root of the filesystem

here is what the algorithm tries to match specifically:
- `<module_name>.js`
- `<module_name>/index.js`
- the file specified inside `<module_name>/package.json`

[here are the full details of the resolve algorithms](nodejsdp.link/resolve)

each package inside the `/node_modules` have its own dependency, so we end up with a dependency tree that looks like this:

```
myApp
├── foo.js
└── node_modules
    ├── depA
    │   └── index.js
    ├── depB
    │   ├── bar.js
    │   └── node_modules
    │       └── depA
    │           └── index.js
    └── depC
        ├── foobar.js
        └── node_modules
            └── depA
                └── index.js
```

in this example, calling `require('depA')` from `/myApp/node_modules/depB/bar.js`, `/myApp/foo.js` and `/myApp/node_modules/depC/foobar.js` will have a different impact each time and will load a different file. This is the trick that lets us avoid *dependency hell* and *collision*, and makes for a great (although bloated) dependency management.

There is also the cache implementation, each module is only loaded once, and then another `require` call will return the cached version of it, it is crucial for performance.

## Circular Dependencies
look at this code:

```js
// module a
exports.loaded = false
const b = require('./b')
module.exports = {
	b,
	loaded: true,
}

// module b
exports.loaded = false
const a = require('./a')
module.exports = {
	a,
	loaded: true,
}

// main.js
const a = require('./a')
const b = require('./b')
console.log('a ->', JSON.stringify(a, null, 2))
console.log('b ->', JSON.stringify(b, null, 2))
```

`main.js` requires `a.js` and `b.js`. In turn, `a.js` requires `b.js` But `b.js` relies on `a.js`
This is the result output:

```
a -> {
    "b": {
        "a": {
            "loaded": false
        },
        "loaded": true
    },
    "loaded": true
}

b -> {
    "a": {
        "loaded": false
    },
    "loaded": true
}
```

So the issue here in practice is that different part of the app will have different view of what is being exported.

## Exporting Modules
The main uses for the module system is to load dependencies, and define APIs, so there should be a balance between private and public functionalities, in other words maximize information hiding and API usability.

Named exports are done by tagging an object we want to make public with the `exports` keyword (or `module.exports`)

```js
// EXPORTS (logger.js)
exports.info = (message) => {
	console.log(`info: ${message}`)
}
exports.verbose = (message) => {
	console.log(`verbose: ${message}`)
}

// IMPORTS
const logger = require('./logger')
logger.info('This is an informational message')
logger.verbose('This is a verbose message')
```

One popular design patter is assigning `module.exports` variable to a function, it honors the principle of *small surface*, here is an example

```js
// EXPORTS
module.exports = (message) => {
	console.log(`info: ${message}`)
}

module.exports.verbose = (message) => {
	console.log(`verbose: ${message}`)
}

// IMPORTS
const logger = require('./logger')
logger('This is an informational message')
logger.verbose('This is a verbose message')
```

Node.js heavily emphasises on the **SRP**, *single-reponsability-principle*, where every module should have responsability over a single functionality that should be encapsulated by this module.

Exporting **Classes** is also a greate way to have extensible code:

```js
// EXPORT
class Logger {
	constructor (name) {
		this.name = name
	}
	log (message) {
		console.log(`[${this.name}] ${message}`)
	}
	info (message) {
		this.log(`info: ${message}`)
	}
	verbose (message) {
		this.log(`verbose: ${message}`)
	}
}
module.exports = Logger

// IMPORT
const Logger = require('./logger')
const dbLogger = new Logger("db")
dbLogger.info('This is an informational message')
const accessLogger = new Logger('ACCESS')
accessLogger.verbose('This is a verbose message')
```

This allows to extend its prototype and create new classes, however in this case, it exposes a lot more of the module interns, but is more powerful when it comes to extensability.

We can also export an instance of the class:

```js
// file logger.js
class Logger {
	constructor (name) {
		this.count = 0
		this.name = name
	}
	log (message) {
		this.count++
		console.log('[' + this.name + '] ' + message)
	}
}
module.exports = new Logger('DEFAULT')

// main.js
const logger = require('./logger')
logger.log('This is an informational message')
```

so all the imports will use the same instance of this object, which creates a ***singleton***, which helps caching the instance, even tho **it is not** garanteed to be unique across the whole app.

However this does not mean we can create a **new instance**, we can use the constructor just fine

```js
const customLogger = new logger.constructor('CUSTOM')
```

It is not recommended however.

We can also patch an existing module and add functionalities to it, which is both dangerous and not recommended…

```js
// inside patcher.js
require('./logger').customAddition = function () {
	console.log('i just added this haha cry about it')
}

// inside main.js
require('./patcher.js')
const logger = require('./logger')
logger.customAddition()
```

## ESM
after seeing CommonJS, it’s time to take a look at ESM, first off by telling Node.js we will be using it either by:
- giving the filename a `.mjs` extension
- in the `package.json`, create a field with the key value: `"type": "module"`

Now everything will be private by default, and only exported stuff is publicly accesssible.

```js
// EXPORTS
// Exports a function as `log`
export function log(message) {
    console.log(message);
}

// Exports a constant as `DEFAULT_LEVEL`
export const DEFAULT_LEVEL = 'info';

// Exports an object as `LEVELS`
export const LEVELS = {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5
};

// Exports a class as `Logger`
export class Logger {
    constructor(name) {
        this.name = name;
    }

    log(message) {
        console.log(`[${this.name}] ${message}`);
    }
}

// IMPORTS
imoprt * as loggerModule from './logger.js'
console.log(loggerModule)

// OUTPUT
[Module] {
	DEFAULT_LEVEL: 'info',
	LEVELS: { error: 0, debug: 1, warn: 2, data: 3, info: 4,
		verbose: 5 },
	Logger: [Function: Logger],
	log: [Function: log]
}
```

the `import` syntax is pretty flexible, it allows for multiple imports and renaming, we can also pick what we want to import:

```js
import { log }
```

> note that we **need** to specify the *file extension* of the imported modules

make sure to not mix thigns up

```js
import { log, Logger } from './logger.js'
log('Hello World')
const logger = new Logger('DEFAULT')
logger.log('Hello world')
```

## Export Default
To follow the SRP CommonJS uses using `module.exports`, we have something that works similiarly, it’s called *default export*, it uses the `default` keyword to look like this:

```js
export default class Logger {
	constructor (name) {
		this.name = name
	}
	
	log (message) {
		console.log(`[${this.name}] ${message}`)
	}
}
```

the `Logger` keyword is ignored in here, it is instead registered under the name `default`, and we import it as such:

```js
import MyLogger from "./logger.js"
// use it here
```

The difference here is that since the name is default, we can give it the name of our choice, it could very well be like this

```js
import viagra from "./logger.js"
```

> also don’t forget the file extension…

however the `default` keyword is reserved and cannot be used for import, it is a reserved keyword and cannot be used for naming variables.

```js
import { default } from "./logger.js"
```

here is an example that uses both exports and imports at the same time:

```js
// EXPORTS
export default function log (message) {
	console.log(message)
}
export function info (message) {
	console.log(`info: ${message}`)
}

// IMPORTS
import defaultLoggerNamedAnything, { info } from "./logger.js"
```

The adavantages of the named exports, is for example, IDE support, when writing `writeFileSync`, the IDE would automatically import `import { writeFileSync } from "fs";` at the top of the file, knowing there is only one `writeFileSync`, while the default export makes things a little more tricky…

It would be more useful in cases where it would be obvious what the user is going to import, what the functionality will be without caring too mucj about the naming.

So it is generally **good practice** to stick to **named exports**, especially when exposing more than one functionality.
This is not written on stone tho, even core node modules have both default and named exports.

we can use *module indetifiers* to specify our imports, here are all of them
- Relative specifiers like `./logger.js` or `../logger.js`. They are used to refer to a path relative to the location of the importing file.
- Absolute specifiers like `file:///opt/nodejs/config.js`. They refer directly and explicitly to a full path. Note that this is the only way with ESM to refer to an absolute path for a module, using a / or a // prefix won't work. This is a significant difference with CommonJS.
- Bare specifiers are identifiers like `fastify` or `http`, and they represent modules available in the `node_modules` folder and generally installed through a package manager (such as npm) or available as *core Node.js modules*.
- Deep import specifiers like `fastify/lib/logger.js`, which refer to a path within a package in `node_modules` (fastify, in this case).

## Async/Dynamic Imports
since we have limitations of not being able to nest imports inside tests and flow statements, and they must be declared at the top of every file, we can overcome these challenges using **async imports**, since, like seen before, the `import()` function is equivalent to a function that takes a module ID and returns a promise that resolves the module whole object.

Now look up the code [here](./chapter2/03-dynamic-import/script.js), more importanly the second part, after handling the edge case, that is how dynamic imports work, there are a couple things to note about it:
- we dynamically build the name of the module we want to import
- the path to the module needs to be a relative path
- this time we use `import()` to import the module dynamically
- the import happens **asynchronously**, so we should use the `.then()` to execute the code after it has been fully imported and loaded, and starts executing when it gets notified about the promise return
- the module *namespace* will be whatever we put inside the `.then()`, in this case `strings`, so we can access whatever is inside the module, inside ours we have exported the `HELLO` property, so we can access it using `strings.HELLO`

here is an example on how you import an installed (either core node.js or installed using npm) module

```js
const condition = true; // Change this to false to import 'fs'

(async () => {
  const module = condition ? await import('http') : await import('fs');
  
  console.log(`Imported module: ${condition ? 'http' : 'fs'}`);
  console.log(module);
})();
```

## Parsing
This is a pretty superficial explanation on how the `node` interpreter works… First off it genreates a ‌*dependency graph* to be able to figure out what modules are imported, and in what order the code needs to be executed, it gets passed some code and the first one to be executed is called the **entry point**, it will then *recursively* follow the imports in a **depth-first style** until all the code necessary is imported, here is the process:
1. constructing and parsing: find all the imports and recuresively load all the neceassary modules content
2. instantiation: for every imported entity, keep a named reference in memeory **wihtout value** yet, no JS code has been executed at this point
3. executing the code: now the entities instantiated before will get a √alue

The difference with CommonJS here is thanks to the dynamic nature of CommonJS, it will execute all the files while the dependency graph is explored, since we have seen that when a new `require` is found, all the previous code has already been executed, so you can use `require` even inside if statements.

In ESM, the three phases seen before are totally seperate, and no code is executed until the whole dependency graph has been loaded.

Thing to note is that ES modules are *read-only* live bindings, if we have a module like this:

```js
export let count = 0
export function increment () {
	count++
}
```

when importing this from another module, we can increment the count variable using `increment()` function, but not using `count++`, this will cause a `TypeError: Assignment to constant variable`, as if we were trying to increment a constant variable, [here](./chapter2/03-dynamic-import/live_binding.js) is a better example to illustrate things…

Now let’s go back to circular dependencies, here we have the same cycle as the ones in CommonJS:

```js
// a.js
import * as bModule from './b.js'
export let loaded = false
export const b = bModule
loaded = true

// b.js
import * as aModule from './a.js'
export let loaded = false
export const a = aModule
loaded = true

// main.js
import * as a from './a.js'
import * as b from './b.js'
console.log('a ->', a)
console.log('b ->', b)
```

it will result in this output

```
a -> <ref *1> [Module] {
	b: [Module] { a: [Circular *1], loaded: true },
	loaded: true
}
b -> <ref *1> [Module] {
	a: [Module] { b: [Circular *1], loaded: true },
	loaded: true
}
```

The difference here is that both `a` and `b` hold a complete picture of each other, thanks to three steps when executing a project in `node`, as ‌`b` here inside `a` is a reference to the same `b` inside the current scope, same for `a` within b… Here are the steps:

1. From `main.js`, **the first import found leads us straight** into `a.js`.
2. In `a.js` we find an import pointing to `b.js`.
3. In `b.js`, we also have an import back to `a.js` (our cycle), but since `a.js` has already been visited, this path is not explored again.
4. we go back to ‌`b.js` but it doesn’t have other imports, we go back to `a.js` and it also does not have any other imports, so when going back to `main.js`, we find another reference to `b.js` that won’t be explored, so it is *ignored*, so the graph end up being a linear module.

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│             │        │             │        │             │
│   main.js   ├───────▶│    a.js     ├───────▶│    b.js     │
│             │        │             │        │             │
└─────────────┘        └─────────────┘        └─────────────┘
```

In the second phase, the instantiation, the interpreter will walk thought hte tree view we built just now starting from `main.js`, and and for every module, it will look for all the exported properties first then build a *map* out of the exported names in memory.

In the intantiation, the module will start from `b.js`, it then discovers that it exports `loaded` and ‌`a`. Then it moved to `a.js`, which exports `loaded` and `b.js`, then moves to `main.js` which does not have any exports.

In this step, the exports map will only keep track of the exported names and not their values, it has not been initialized yet… So here before the evaluation we have:
- `b.js` linking the exports from `a.js`, referring to them as `aModule`
- `a.js` linking the exports from `b.js`, referring to them as `bModule`
- ‌ `main.js` will import all the exports in `b.js`, referring to them as `b`, similarly, it will import everything from `a.js`, referring to them as `a`.

Now in the *evaluation* phase, the most important part is the execution order, it will be **bottom-up** respecting the post-order depth-first visit of our original dependency graph, so to be clear… `main.js` will be the *last* to execute.

## Modify Modules
like seen before, if we reassign a value to a variable of another module, it will give us a `TypeError`, because of *read-only bindings*, but if one of the bindings is an *object*, we can reassign some of the object’s properties. [here](./chapter2/03-dynamic-import/reassign.js) is an example.

In the example code, the output will be:

```
[ 'path', 'options', 'callback' ]
[ 'path', 'cb' ]
[ 'path', 'options', 'callback' ]
```

there is another [code](./chapter2/03-dynamic-import/mock-test.js) that tests the implementation, however… this code implementation is not recommended and is very **fragile**.

## Differences
here are some last differences between ESM and CommonJS…
- file extension are required in ESM but optional in CommonJS
- ESM runs on strict mode, it **cannot** be disabled, so we cannot do things such as use undeclared variables, use the `with` statement, or other features related to non-strict mode…
- in ESM, there are some unavailable references such as `require`, `exports`, `module.exports`, `__filename`, `__dirname`, you will get a `ReferenceError`. instead we should use `‌import.meta.url` for the `__filename`, and `dirname(import.meta.url)` for getting the current folder. There is also a method to recreate the `require` function…
- `this` keyword in CommonJS us a reference to `exports`, but in ESM, `this` is undefined
- in ESM, we cannot import JSON files directly like in CommonJS, this `import data from './data.json'` will cause an error
- we can import CommonJS modules from ESM, but this is limited to default exports

# Chapter 3
Let’s define asynchronous programming, before starting, when talking about synchrouns code, we know each line of that code is blocking, which means it cannot execute the next line/command until the current one is completed… meanwhile, asynchronous code is *launched and executed in the background*, until it is resolved or rejected, examples could be things such as reading from a file or performing a network request, or maybe performing a database query… things that would require a little bit of time, but we need to get notified when it has executed and completed. The most basic way to implement that is using **callbacks**, since without these, **we would not have promises, or `async` `await`**, which are a more elegant way of dealing with asynchronous operations.

## Callbacks
A callback is a function invoked to propagate the result of an operation… They replace the role of the `return` inscruction, which always executes synchronously, another good construct for implementing callbacks are closures, more info [here](nodejsdp.link/mdn-closures)…

So a callback is a function that is passed as an argument to another function, and it is invoked once the operation is finished. In functional programming, this this called *coninuation-passing style*.

This simply means that the result is propagated by assing it to another function (in this case, the callback), instead of directly returning it to the caller.

here is a more practical example:

```js
// simple synchronous function
function add (a, b) {
	return a + b
}

// CPS equivalent
function addCps (a, b, callback) {
	callback(a + b)
}
```

the `addCps` function is synchronous, because it will complete only when the callback completes, here is an asynchronous CPS example:

```js
function additionAsync (a, b, callback) {
	setTimeout(() => callback(a, b), 100)
}
```

here, we used `setTimeout` to simulate an async call, now if we make a call like this

```js
console.log('before')
additionAsync(1, 2, result => console.log(`Result: ${result}`))
console.log('after')

// OUTPUT
before
after
Result: 3
```

So in here, since `setTimeout` is an async operation, it does not wait for the callback to be executed, instead it returns.

So inside the async function, when the async opration is complete, its execution is then resumed, starting from the callback that caused the unwinding.

To make things easier:
- a synchronous function just executes while blocking until it finishes
- a async function returns immediately, its result is passed to a *handler*, in this case, a callback, at a later cycle of the event loop.

## Real Life Applications
A very dangerous situation to have irl is a function that would behave *synchronously* under certain conditions and *asynchronously* under others. inside and `if else` block for example, look at [this](./chapter3/unpredictable.js) code as an instance.

Now to get rid of these issue, there are a couple fixes, like explicitely making the code synchornous, this is possible because node.js provides a * direct style synchronous counterpart* for most of the basic I/O programs, such as `fs.readFileSync()`, you need to keep these in mind:
- there might not be a synchronous countrerpart for all/most the available functions
- a synchronous API will block all the event loop, which would brick the app in case it does not resolve fast

> using synchronous I/O in node.is is **strongly discouraged** in most situations, so Use blocking APIs sparingly and only when they don't affect the ability of the application to handle concurrent asynchronous operations.

The other solution is ofc to make all the functionality asynchronous, the suggested 

> You can guarantee that a callback is invoked asynchronously by deferring its execution using `process.nextTick()`

## Callback Conventions & Best Practices
- callback comes last in parameters, even in the presence of optional parameteres, for example `‌readFile(filename, [options], callback)`, this is made so that the function call will be more readable
- error always come first, here is an example:

```js
readFile('file.txt', 'utf-8', (err, data) => {
	if (err) {
		handleError(err)
	} else {
		processData(err)
	}
})
```

- it best to always check for error, to make things easier to manage, also it is best to make sure the error must be of type `Error`, so things such as strings and numbers shouldn’t be passed as error objects.
- propagate the error, do not return it or throw it, just use the callback as if it was any other result, practical example [here](./chapter3/error-propagation.js)
- when making synchronous operations, we should use traditional `try catch` instructions to catch the error
- invoking the callback inside a `try` block would catch any error thrown from the execution of the callback, and we do not want that
- with *uncaught errors*, it is better to stop running the application, and ideally, a supervising process should restart the app being ran… it is knowns as the **fail-fast** approach

## The Observer pattern
The `EventEmitter` class already exists in node.js, which allows us to register one or more function as a listener, which will be invoked when a certain type of event is fired, so… there could be a lot be more than one *emitter*, and there could be more than one *listener* to each emitter. We use the class like this

```js
import { eventEmitter } from 'events'
const emitter = new EventEmitter()
```

here are some useful methods:
- `on(event, listener)` this allows us to register a new listener
- `once(event, listener)` this register a new listener that will be remove after being used once
- `emit(event. [arg1], [...])` creates a new event and lets us pass arguments to the listener
- `‌removeListener(event, listener)` removes a listener from an emitter

These will return the `EventEmitter` instance to allow chaining.

[Here](./chapter3/event-emitter-example.js) is a pract

> The EventEmitter treats the error event in a special way. It will automatically throw an exception and exit from the application if such an event is emitted and no associated listener is found. For this reason, it is recommended to always register a listener for the error event.

The most common way `EventEmiiter` is used is by extending it by other classes, [here](./chapter3/observable-object.js) is a practical example… Now classes would also provide the `on` method.

This can be useful is cases like inheriting from the `Server` object in the core `http` module, where you can create methods like `request` that triggers when a new request is received, same for `connection` or `closed`.

it is very important to **unsubscribe** our listeners once they’re no longer needed to not cause ‌**memory leaks**, here is a real example:

```js
const thisTakesMemory = 'A big string...'
const listener = () => {
	console.log(thisTakesMemory)
}
emitter.on(<event_name>, listener)
```

These unrealeased `EventEmitters` are the most common source of memeory leaks in Node.js, to avoid that we simply use this method:

```js
emitter.removeListner(<event_name>, listener)
```

> It has a build in mechanism to warn devs, after listeners have been registered (by default) 10 times, then the `EventEmitter` will produce a warning.

## EventEmitter VS Callbacks
- use callbacks when a result needs to be returned in a *asynchronous way*
- event should be used when there is a need to communicate that something happened