/** "abc-123" / "ABC 123" → "ABC123", so the same plate always compares equal. */
export function normalizePlate(raw?: string): string {
  return (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Colombian plates have 6 characters (cars ABC123, motorcycles ABC12D); 5–7 leaves room for special ones. */
export function isValidPlate(plate: string): boolean {
  return /^[A-Z0-9]{5,7}$/.test(plate) && /[A-Z]/.test(plate) && /[0-9]/.test(plate);
}

/** Last digit of the plate (what the listing shows publicly, for Pico y Placa). */
export function plateLastDigit(plate: string): string {
  const digits = plate.replace(/\D/g, '');
  return digits.slice(-1);
}
