import { createHash } from 'node:crypto';

function stableValue(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableValue).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableValue(entry)}`).join(',')}}`;
}

export function hashCommandRequest(command: string, commandId: string, payload: unknown): string {
  return createHash('sha256')
    .update(command)
    .update('\0')
    .update(commandId)
    .update('\0')
    .update(stableValue(payload))
    .digest('hex');
}
