/** Two-digit, zero-padded string for lesson numbers (e.g. `01`, `09`). */
export function pad(value: number): string {
  return String(value).padStart(2, '0')
}
