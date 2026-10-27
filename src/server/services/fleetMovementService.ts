import { canIssueFleetCommand, travelSeconds, type FleetCommand } from '../../engine/fleetEngine';
import type { Coordinates, FleetState, ID } from '../../engine/types';
import type { FleetRepository } from '../repositories/fleetRepository';

export class FleetMovementService {
  constructor(private readonly fleets: FleetRepository) {}

  async move(ownerId: ID, fleetId: ID, destination: Coordinates, speed: number, now: number): Promise<FleetState> {
    const fleet = await this.fleets.getById(fleetId);
    if (!fleet) throw new Error('FLEET_NOT_FOUND');
    const command: FleetCommand = {
      fleetId,
      ownerId,
      order: 'move',
      from: fleet.location,
      to: destination,
      issuedAt: now,
    };
    if (!canIssueFleetCommand(ownerId, command)) throw new Error('FLEET_COMMAND_FORBIDDEN');
    const durationSeconds = travelSeconds(fleet.location, destination, speed);
    const updated: FleetState = {
      ...fleet,
      destination: { ...destination },
      order: 'move',
      departureAt: now,
      arrivalAt: now + durationSeconds * 1000,
    };
    await this.fleets.save(updated);
    return updated;
  }

  async resolveArrival(fleetId: ID, now: number): Promise<FleetState> {
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
