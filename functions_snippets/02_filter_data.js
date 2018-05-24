if (
  message.hum < 0 ||
  message.hum > 100 ||
  message.temp > 100 ||
  message.temp < -50
) {
  // Validate and do nothing
  return null;
}
