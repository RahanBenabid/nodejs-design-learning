setTimeout(() => {
  console.log("Synchronous 1")
  Promise.resolve("Promise 1").then(console.log)
  Promise.reject("Promise 2").catch(console.log)
  queueMicrotask(() => console.log("queueMicrotask 1"))
  console.log("Synchronous 2")
  
  process.nextTick(console.log, "next Tick 1")
}, 0)

setTimeout(console.log, 0, "setTimeout 2")
setTimeout(console.log, 0, "setTimeout 3")