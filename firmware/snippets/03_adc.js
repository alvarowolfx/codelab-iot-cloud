load("api_adc.js");

ADC.enable(0);

let getInfo = function() {
  return JSON.stringify({
    t: dht.getTemp(),
    h: dht.getHumidity(),
    light: ADC.read(0)
  });
};
