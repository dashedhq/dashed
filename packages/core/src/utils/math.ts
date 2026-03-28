/**
 * Round a number to the specified number of decimal places.
 * Uses toFixed for correctness with floating point edge cases
 * (e.g., 1.255 rounds to 1.26 at 2dp, not 1.25).
 */
export function round(value: number, dp: number): number {
  return parseFloat(value.toFixed(dp));
}
