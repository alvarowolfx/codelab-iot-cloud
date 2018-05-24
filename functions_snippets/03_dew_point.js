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
