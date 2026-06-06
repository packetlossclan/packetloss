export const MATCHES_PER_SEASON = 28;
export const INITIAL_OFFSET = 33;

export function rankedTitle(n: number): string {
  const season = Math.ceil(n / MATCHES_PER_SEASON);
  const match = ((n - 1) % MATCHES_PER_SEASON) + 1;
  return `Rankeada #${match} Temporada: ${season}`;
}
