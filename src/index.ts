/**
 * A template tag to parse and evaluate an expression consisting of
 * {@linkcode https://github.com/tc39/proposal-decimal | Decimal} numbers and basic arithmetic
 * operators (`+`, `-`, `*`, `/`).
 *
 * The {@link default | default export} uses the global `Decimal` constructor, while
 * {@linkcode createDecimalTag} allows providing your own `Decimal` implementation.
 *
 * ```ts
 * import d from "@nic/decimal-literal";
 *
 * d`0.1 + 0.2`.equals(d`0.3`); // true
 * ```
 *
 * ```ts
 * import d from "@nic/decimal-literal";
 *
 * d`0.1`.toPrecision(20) === "1.1000000000000000000"; // true
 * ```
 *
 * ```ts
 * import d from "@nic/decimal-literal";
 *
 * const zeroPointTwo = d`0.2`;
 * d`0.1 + ${zeroPointTwo}`.equals(d`0.3`); // true
 * ```
 *
 * A more complex example, coming from the
 * {@link https://github.com/tc39/proposal-decimal | proposal's readme}:
 *
 * ```ts
 * function calculateBill(items, tax) {
 *   let total = d`0`;
 *   for (let {price, count} of items) {
 *     total = d`${total} + ${price} * ${count}`;
 *   }
 *   return d`${total} * (${tax} + 1)`;
 * }
 *
 * let items = [{price: "1.25", count: "5"}, {price: "5.00", count: "1"}];
 * let tax = "0.0735";
 * console.log(calculateBill(items, tax).toString({ numDecimalDigits: 2 }));
 * ```
 *
 * @module
 */

import { tokenize } from "./tokenize.ts";
import { evaluate, type DecimalConstructor, type Decimal } from "./evaluate.ts";
import { intersperse, map } from "./iterator-helpers.ts";

export type { Decimal };

/**
 * The template tag function provided by this module. See the module documentation for more details.
 *
 * @typeParam Decimal The Decimal type to work with. This can be different from the global Decimal,
 *                    for example when using a polyfill.
 */
export type DecimalTag<Decimal> = (
  parts: TemplateStringsArray,
  ...quasis: Array<string | Decimal>
) => Decimal;

/**
 * Create a {@link DecimalTag} using a custom `Decimal` constructor.
 *
 * @param Decimal The `Decimal` constructor to use. If not provided, the global `Decimal`
 *                constructor is used.
 */
export function createDecimalTag<T extends new (value: string) => Decimal>(
  Decimal: T // This could actually also be `undefined`
): DecimalTag<InstanceType<T>> {
  return function d(parts, ...quasis) {
    return evaluate(
      intersperse(
        map(parts.values(), (part) => tokenize(part)),
        map(quasis.values(), (value) => ({
          type: "Value",
          value: typeof value === "string" ? new Decimal(value) : value,
        }))
      ),
      Decimal
    ) as InstanceType<T>;
  };
}

/**
 * A {@link DecimalTag} using the global `Decimal` constructor.
 */
const _default = createDecimalTag<DecimalConstructor>(
  undefined as never
) as DecimalTag<Decimal>;
export { _default as default };
