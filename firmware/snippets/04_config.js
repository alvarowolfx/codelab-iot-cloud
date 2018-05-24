load("api_config.js");

let topic = "/devices/" + Cfg.get("device.id") + "/events";
let led = Cfg.get("pins.led"); // BUILTIN LED GPIO2 = D4
let button = Cfg.get("pins.button"); // GPI0 = D3

// Add to config_schema on mos.yml
// - ["pins.button", "i", 14, {title: "DHT GPIO pin"}]
