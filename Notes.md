# My Personal About NodeJS, Feel Free To Read

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

```
Connection A, B, C
       |
       v
    +--------+
    | Server |
    +--------+
       |
       v
+-------------------------------------+
|          Thread                     |
|   +-----------------------------+   |
|   |  Idle Time                  |   |
|   +-----------------------------+   |
|   |  Handle Data from A         |   |
|   +-----------------------------+   |
|   |  Idle Time                  |   |
|   +-----------------------------+   |
|   |  Handle Data from B         |   |
|   +-----------------------------+   |
|   |  Idle Time                  |   |
|   +-----------------------------+   |
|   |  Handle Data from C         |   |
|   +-----------------------------+   |
|   |  Idle Time                  |   |
|   +-----------------------------+   |
|                                     |
+-------------------------------------+
```

instead of being spead over multiple threads, the data is spread over time.

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

### More About CommmonJS
Built originally into NodeJS, it has CommonJS specification:
- the `require` function, it allows you to import moducles from the local filesystem
- the `exports` and `module.exports` that are used to export public functionalities from the current module

