export function round(value: number, digits = 0) {
  if (!Number.isFinite(value) || !Number.isFinite(digits)) return value;

  const factor = 10 ** Math.trunc(digits);

  if (!Number.isFinite(factor) || factor === 0) return value;

  return Math.round((value + Math.sign(value || 1) * Number.EPSILON) * factor) / factor;
}
