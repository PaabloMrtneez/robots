import { CryptoIdGenerator } from "../../src/infrastructure/ids/CryptoIdGenerator";
import { SystemClock } from "../../src/infrastructure/time/SystemClock";

describe("infrastructure adapters", () => {
  it("generates UUID identifiers", () => {
    expect(new CryptoIdGenerator().generate()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("returns the current time", () => {
    expect(new SystemClock().now()).toBeInstanceOf(Date);
  });
});
