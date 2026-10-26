export function parseStatValue(
  value: string,
  suffix: string | null,
): {
  amount: number | null;
  display: string;
} {
  const match = /^(?<amount>\d+)(?<rest>.*)$/.exec(value);
  const display = `${value}${suffix ?? ''}`;
  if (!match?.groups?.amount) {
    return { amount: null, display };
  }
  return { amount: Number(match.groups.amount), display };
}
