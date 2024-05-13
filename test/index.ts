import { createDecimalTag } from "../src/index.ts";
import { BigDecimal } from "@yaffle/bigdecimal";

import { test } from "node:test";
import assert from "node:assert";

class Decimal {
  #val: BigDecimal;
  constructor(value: string | BigDecimal) {
    this.#val =
      typeof value === "string" ? BigDecimal.BigDecimal(value) : value;
  }
  add(other: Decimal): Decimal {
    return new Decimal(BigDecimal.add(this.#val, other.#val));
  }
  subtract(other: Decimal): Decimal {
    return new Decimal(BigDecimal.subtract(this.#val, other.#val));
  }
  times(other: Decimal): Decimal {
    return new Decimal(BigDecimal.multiply(this.#val, other.#val));
  }
  divide(other: Decimal): Decimal {
    return new Decimal(BigDecimal.divide(this.#val, other.#val));
  }
  toPrecision(n: number): string {
    return this.#val.toPrecision(n);
  }
  equals(other: Decimal): boolean {
    return BigDecimal.equal(this.#val, other.#val);
  }
}

const d = createDecimalTag(Decimal);

test("#1", () => {
  const val = d`1.1`;

  assert.equal(val.toPrecision(20), "1.1000000000000000000");
});

test("#2", () => {
  assert(d`0.1 + 0.2`.equals(d`0.3`));
});

test("#3", () => {
  const zero1 = d`0.1`;
  const zero2 = d`0.2`;
  assert(d`${zero1} + ${zero2}`.equals(d`0.3`));
});

test("#4", () => {
  assert(d`0.1 + ${"0.2"}`.equals(d`0.3`));
});

test("#5", () => {
  assert(d`1 + 2 - 4`.equals(d`-1`));
});
