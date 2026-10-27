import { canDial, dial, type Stargate } from '../../engine/stargateEngine';

export interface GateTravelResult {
  gate: Stargate;
  targetGateId: string;
  travelStartedAt: number;
  travelEndsAt: number;
}

export class StargateService {
  constructor(private readonly travelDurationMs = 5_000) {}

  dial(source: Stargate, target: Stargate, now: number): GateTravelResult {
    if (!canDial(source, target, now)) throw new Error('GATE_UNAVAILABLE');
    const gate = dial(source, target, now, 60_000);
    return {
      gate,
      targetGateId: target.id,
      travelStartedAt: now,
      travelEndsAt: now + this.travelDurationMs,
    };
  }
}
