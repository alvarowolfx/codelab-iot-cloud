// npm install @google-cloud/bigquery
const bigquery = require("@google-cloud/bigquery")();

/**
 * Store all the raw data in bigquery
 */
function insertIntoBigquery(data) {
  const dataset = bigquery.dataset("weather_station_iot");
  const table = dataset.table("raw_data");

  return table.insert(data, { ignoreUnknownValues: true });
}

Promise.all([insertIntoBigquery(data), updateCurrentDataFirebase(data)]);
