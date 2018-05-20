load("api_mqtt.js");

MQTT.setEventHandler(function(conn, ev, edata) {
  if (ev !== 0) print("MQTT event handler: got", ev);
}, null);

// Inside button handler
let message = getInfo();
let ok = MQTT.pub(topic, message, 1);
print("Published:", ok, topic, "->", message);

let configTopic = "/devices/" + Cfg.get("device.id") + "/config";

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
