load("api_gpio.js");
load("api_timer.js");

let led = 2; // BUILTIN LED GPIO2 = D4
let button = 0; // GPI0 = D3

print("LED GPIO:", led, "button GPIO:", button);

GPIO.set_mode(led, GPIO.MODE_OUTPUT);

let value = GPIO.read(led);
GPIO.write(led, value === 0 ? 1 : 0);

// Blink built-in LED every 5 seconds
Timer.set(
  5000 /* 5 sec */,
  Timer.REPEAT,
  function() {
    let value = GPIO.toggle(led);
    print(value ? "Tick" : "Tock");
  },
  null
);

// Button is wired to GPIO pin 0
GPIO.set_button_handler(
  button,
  GPIO.PULL_UP,
  GPIO.INT_EDGE_NEG,
  200,
  function() {
    GPIO.toggle(led);
    print("Button pressed!");
  },
  null
);
