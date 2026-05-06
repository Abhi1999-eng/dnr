export function normalizeExpectedOutcomes(input: unknown): string[] {
  const values = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(/\r?\n/)
      : [];

  return values
    .map((value) => String(value ?? '').trim())
    .map((value) => value.replace(/^[•\-\u2022\s]+/, '').trim())
    .filter(Boolean);
}

export function expectedOutcomesToTextarea(input: unknown): string {
  return normalizeExpectedOutcomes(input).join('\n');
}
