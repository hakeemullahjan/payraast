const DECIMALS = 7;
const SCALE = 10n ** BigInt(DECIMALS);

export function toStroops(amount: string): bigint {
  const [whole = "0", fraction = ""] = amount.split(".");
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(DECIMALS, "0"));
}

export function fromStroops(value: bigint): string {
  const whole = value / SCALE;
  const fraction = (value % SCALE).toString().padStart(DECIMALS, "0");
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}
