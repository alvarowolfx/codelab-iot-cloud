const functions = require("firebase-functions");
const admin = require("firebase-admin");

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

    const data = {
      total_ram: message.total_ram,
      free_ram: message.free_ram,
      humidity: message.hum,
      temp: message.temp,
      light: message.light,
      deviceId: deviceId,
      timestamp: context.timestamp
    };

    return updateCurrentDataFirebase(data);
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
    lastTimestamp: data.timestamp
  });
}
