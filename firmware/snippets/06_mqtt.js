load("api_mqtt.js");

// Inside button handler
function publishData() {
  let message = getInfo();
  let ok = MQTT.pub(topic, message);
  if (ok) {
    print("Published", message);
  } else {
    print("Error publishing");
  }
}

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

MQTT.setEventHandler(function(conn, ev) {
  if (ev === MQTT.EV_CONNACK) {
    print("CONNECTED");
    //isConnected = true;
    //publishData();
  }
}, null);
