import type { Coordinates, FleetOrderType } from './types';

export interface FleetCommand {
  fleetId: string;
  ownerId: string;
  order: FleetOrderType;
  from: Coordinates;
  to?: Coordinates;
  issuedAt: number;
}

function isValidCoordinate(value: Coordinates): boolean {
  return [value.galaxy, value.system, value.planet].every(
    (coordinate) => Number.isSafeInteger(coordinate) && coordinate > 0,
  );
}

export function distance(a: Coordinates, b: Coordinates): number {
  if (!isValidCoordinate(a) || !isValidCoordinate(b)) throw new Error('INVALID_COORDINATES');
  const result =
    Math.abs(a.galaxy - b.galaxy) * 10000 +
    Math.abs(a.system - b.system) * 100 +
    Math.abs(a.planet - b.planet);
  if (!Number.isSafeInteger(result)) throw new Error('INVALID_COORDINATES');
  return result;
}

export function travelSeconds(a: Coordinates, b: Coordinates, speed: number): number {
  if (!Number.isFinite(speed) || speed <= 0) throw new Error('INVALID_SPEED');
  return Math.max(1, Math.ceil((distance(a, b) * 3600) / speed));
}

export function canIssueFleetCommand(ownerId: string, command: FleetCommand): boolean {
  return Boolean(ownerId) && ownerId === command.ownerId && command.fleetId.length > 0;
}
