load("api_events.js");
load("api_net.js");
load("api_sys.js");
load("api_gpio.js");
load("api_timer.js");
load("api_dht.js");
load("api_config.js");
load("api_mqtt.js");
load("api_http.js");
load("api_adc.js");

let topic = "/devices/" + Cfg.get("device.id") + "/events";
let configTopic = "/devices/" + Cfg.get("device.id") + "/config";

let led = Cfg.get("pins.led"); // BUILTIN LED GPIO2 = D4
let button = Cfg.get("pins.button"); // GPI0 = D3
let dhtPin = 14; // GPIO14 = D5
let dht = DHT.create(dhtPin, DHT.DHT11);

ADC.enable(0); // A0 Pin

print("LED GPIO:", led, "button GPIO:", button);

let getInfo = function() {
  return JSON.stringify({
    t: dht.getTemp(),
    h: dht.getHumidity(),
    light: ADC.read(0),
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
  });
};

let sendInfo = function() {
  HTTP.query({
    url: "http://httpbin.org/post",
    data: getInfo(),
    success: function(body, full_http_msg) {
      print(body);
    },
    error: function(err) {
      print(err);
    } // Optional
  });
};

// Blink built-in LED every second
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
Timer.set(
  1000 /* 1 sec */,
  Timer.REPEAT,
  function() {
    //let value = GPIO.toggle(led);
    //print(value ? "Tick" : "Tock", Sys.uptime(), getInfo());
    print(getInfo());
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
    print("Button pressed!");
    let message = getInfo();
    let ok = MQTT.pub(topic, message, 1);
    print("Published:", ok, topic, "->", message);

    sendInfo();
  },
  null
);

MQTT.sub(
  configTopic,
  function(conn, topic, msg) {
    print("Topic:", topic, "message:", msg);
    let config = JSON.parse(msg);
    if (config.led !== undefined) {
      GPIO.write(led, config.led === 0 ? 1 : 0);
    }
  },
  null
);

MQTT.setEventHandler(function(conn, ev, edata) {
  if (ev !== 0) print("MQTT event handler: got", ev);
}, null);

// Monitor network connectivity.
Event.addGroupHandler(
  Net.EVENT_GRP,
  function(ev, evdata, arg) {
    let evs = "???";
    if (ev === Net.STATUS_DISCONNECTED) {
      evs = "DISCONNECTED";
    } else if (ev === Net.STATUS_CONNECTING) {
      evs = "CONNECTING";
    } else if (ev === Net.STATUS_CONNECTED) {
      evs = "CONNECTED";
    } else if (ev === Net.STATUS_GOT_IP) {
      evs = "GOT_IP";
    }
    print("== Net event:", ev, evs);
  },
  null
);
