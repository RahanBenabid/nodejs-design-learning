import { EventEmitter } from "events";

function ticker(limit, callback) {
  const emitter = new EventEmitter();
  const start = Date.now();
  let ticknumber = 0;

  // Function to handle ticks and errors
  function handleTick() {
    const timestamp = Date.now();
    if (timestamp % 5 === 0) {
      const error = new Error("Timestamp divisible by 5");
      emitter.emit("error", error); // Propagate error via EventEmitter
      callback(error, ticknumber); // Propagate error via callback
      return; // Stop further execution
    }
    ticknumber += 1;
    emitter.emit("tick");
  }

  // Emit the first tick immediately (Exercise 3.3)
  handleTick();

  function repeatingFunc() {
    const elapsed = Date.now() - start;
    if (elapsed < limit) {
      handleTick(); // Check for errors and emit tick
      setTimeout(repeatingFunc, 50); // Schedule next tick
    } else {
      callback(null, ticknumber); // No error, pass tick count
    }
  }

  // Start the recurring ticks after 50ms
  setTimeout(repeatingFunc, 50);

  return emitter;
}

// Callback function to handle results or errors
function printTicks(error, ticknumbers) {
  if (error) {
    console.log(`Error occurred: ${error.message}`);
  } else {
    console.log(`The number of ticks was ${ticknumbers}`);
  }
}

// Usage with error handling
ticker(5000, printTicks)
  .on("tick", () => console.log("tick"))
  .on("error", (err) => console.log(`EventEmitter error: ${err.message}`));