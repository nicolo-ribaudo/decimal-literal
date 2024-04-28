# `@nic/decimal-literal`

A template tag to parse and evaluate an expression consisting of
[Decimal](https://github.com/tc39/proposal-decimal) numbers and basic arithmetic
operators (`+`, `-`, `*`, `/`).

The default export uses the global `Decimal` constructor, while
`createDecimalTag` allows providing your own `Decimal` implementation.

## Installation

See [the JSR docs](https://jsr.io/@nic/decimal-literal) on how to use packages
from the JSR registry.

## Examples

```ts
import d from "@nic/decimal-literal";
d`0.1 + 0.2`.equals(d`0.3`); // true
```
```ts
import d from "@nic/decimal-literal";
d`0.1`.toPrecision(20) === "1.1000000000000000000"; // true
```
```ts
import d from "@nic/decimal-literal";
const zeroPointTwo = d`0.2`;
d`0.1 + ${zeroPointTwo}`.equals(d`0.3`); // true
```