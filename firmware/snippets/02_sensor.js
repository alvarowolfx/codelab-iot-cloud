load("api_dht.js");

let dhtPin = 14; // GPIO14 = D5
let dht = DHT.create(dhtPin, DHT.DHT11);

let getInfo = function() {
  return JSON.stringify({
    temp: dht.getTemp(),
    hum: dht.getHumidity()
  });
};

print(value ? "Tick" : "Tock", getInfo());
