import { Clock } from "../../src/application/ports/Clock";
import { IdGenerator } from "../../src/application/ports/IdGenerator";

export class FixedClock implements Clock {
  constructor(private readonly fixedDate = new Date("2026-04-22T00:00:00.000Z")) {}

  now(): Date {
    return this.fixedDate;
  }
}

export class FixedIdGenerator implements IdGenerator {
  constructor(
    private readonly fixedId = "00000000-0000-4000-8000-000000000001"
  ) {}

  generate(): string {
    return this.fixedId;
  }
}
