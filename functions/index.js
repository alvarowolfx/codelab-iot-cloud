const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bigquery = require("@google-cloud/bigquery")();
const cors = require("cors")({ origin: true });

admin.initializeApp();

const db = admin.database();

/**
 * Receive data from pubsub, then
 * Write telemetry raw data to bigquery
 * Maintain last data on firebase realtime database
 */
exports.receiveTelemetry = functions.pubsub
  .topic("weatherdata")
  .onPublish((event, context) => {
    const attributes = event.attributes;
    const message = event.json;

    const deviceId = attributes.deviceId;

    if (
      message.hum < 0 ||
      message.hum > 100 ||
      message.temp > 100 ||
      message.temp < -50
    ) {
      // Validate and do nothing
      return null;
    }

    const data = {
      total_ram: message.total_ram,
      free_ram: message.free_ram,
      humidity: message.hum,
      temp: message.temp,
      light: message.light,
      deviceId: deviceId,
      timestamp: context.timestamp
    };

    data.dewpoint = computeDewpoint(data.temp, data.humidity);

    return Promise.all([
      insertIntoBigquery(data),
      updateCurrentDataFirebase(data)
    ]);
  });

/**
 * Query bigquery with the last 7 days of data
 * HTTPS endpoint to be used by the webapp
 */
exports.getReportData = functions.https.onRequest((req, res) => {
  const table = "`iot2analytics-205013.weather_station_iot.raw_data`";

  const query = `
      SELECT 
        TIMESTAMP_TRUNC(data.timestamp, HOUR, 'America/Cuiaba') data_hora,
        avg(data.temp) as avg_temp,
        avg(data.humidity) as avg_hum,
        avg(data.light) as avg_light,
        min(data.temp) as min_temp,
        max(data.temp) as max_temp,
        min(data.humidity) as min_hum,
        max(data.humidity) as max_hum,
        min(data.light) as min_light,
        max(data.light) as max_light,
        count(*) as data_points      
      FROM ${table} data
      WHERE data.timestamp between timestamp_sub(current_timestamp, INTERVAL 7 DAY) and current_timestamp()
      group by data_hora
      order by data_hora
    `;

  return bigquery
    .query({
      query: query,
      useLegacySql: false
    })
    .then(result => {
      const rows = result[0];

      cors(req, res, () => {
        res.json(rows);
      });

      return;
    });
});

/**
 * Maintain last status in firebase
 */
function updateCurrentDataFirebase(data) {
  return db.ref(`/devices/${data.deviceId}`).set({
    humidity: data.humidity,
    temp: data.temp,
    light: data.light,
    total_ram: data.total_ram,
    free_ram: data.free_ram,
    dewpoint: data.dewpoint,
    lastTimestamp: data.timestamp
  });
}

/**
 * Store all the raw data in bigquery
 */
function insertIntoBigquery(data) {
  const dataset = bigquery.dataset("weather_station_iot");
  const table = dataset.table("raw_data");

  return table.insert(data, { ignoreUnknownValues: true });
}

const A = 8.1332;
const B = 1763.39;
const C = 235.66;

function computeDewpoint(temp, rh) {
  const exponent = A - B / (temp + C);
  const pp = Math.pow(10, exponent);
  const denom = Math.log10(rh * (pp / 100.0)) - A;
  const TDP = -1 * (B / denom + C);
  return TDP; // in Celsius
}
