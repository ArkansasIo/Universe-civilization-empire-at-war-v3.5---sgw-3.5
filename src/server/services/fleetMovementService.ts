import { canIssueFleetCommand, travelSeconds, type FleetCommand } from '../../engine/fleetEngine';
import type { Coordinates, FleetState, ID } from '../../engine/types';
import type { FleetRepository } from '../repositories/fleetRepository';

export class FleetMovementService {
  constructor(private readonly fleets: FleetRepository) {}

  async move(ownerId: ID, fleetId: ID, destination: Coordinates, speed: number, now: number): Promise<FleetState> {
    if (!ownerId || !fleetId) throw new Error('INVALID_FLEET_COMMAND');
    if (!Number.isFinite(now) || now < 0) throw new Error('INVALID_DEPARTURE_TIME');

    const fleet = await this.fleets.getById(fleetId);
    if (!fleet) throw new Error('FLEET_NOT_FOUND');
    if (fleet.ownerId !== ownerId) throw new Error('FLEET_COMMAND_FORBIDDEN');

    const command: FleetCommand = {
      fleetId,
      ownerId: fleet.ownerId,
      order: 'move',
      from: fleet.location,
      to: destination,
      issuedAt: now,
    };
    if (!canIssueFleetCommand(ownerId, command)) throw new Error('FLEET_COMMAND_FORBIDDEN');
    const durationSeconds = travelSeconds(fleet.location, destination, speed);
    const arrivalAt = now + durationSeconds * 1000;
    if (!Number.isSafeInteger(arrivalAt)) throw new Error('INVALID_ARRIVAL_TIME');
    const updated: FleetState = {
      ...fleet,
      destination: { ...destination },
      order: 'move',
      departureAt: now,
      arrivalAt,
    };
    await this.fleets.save(updated);
    return updated;
  }

  async resolveArrival(fleetId: ID, now: number): Promise<FleetState> {
    if (!fleetId || !Number.isFinite(now) || now < 0) throw new Error('INVALID_ARRIVAL_CHECK');
    const fleet = await this.fleets.getById(fleetId);
    if (!fleet) throw new Error('FLEET_NOT_FOUND');
    if (!fleet.destination || fleet.arrivalAt === undefined || now < fleet.arrivalAt) return fleet;
    const updated: FleetState = {
      ...fleet,
      location: fleet.destination,
      destination: undefined,
      order: 'defend',
      departureAt: undefined,
      arrivalAt: undefined,
    };
    await this.fleets.save(updated);
    return updated;
  }
}
