load("api_adc.js");

ADC.enable(0);

let getInfo = function() {
  return JSON.stringify({
    temp: dht.getTemp(),
    hum: dht.getHumidity(),
    light: ADC.read(0)
  });
};
