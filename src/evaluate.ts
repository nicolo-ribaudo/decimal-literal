import { PeekableInfiniteIterator, fillEnd } from "./iterator-helpers.ts";
import { type Token as TokenizerToken, Tokens } from "./tokenize.ts";

declare const globalThis: {
  Decimal: DecimalConstructor;
};

/**
 * See the {@link https://github.com/tc39/proposal-decimal | Decimal proposal}
 */
export interface Decimal {
  add(other: Decimal): Decimal;
  subtract(other: Decimal): Decimal;
  times(other: Decimal): Decimal;
  divide(other: Decimal): Decimal;
}
export type DecimalConstructor = new (value: string) => Decimal;

export type EvaluatorToken = TokenizerToken | { type: "Value"; value: Decimal };

export function evaluate(
  tokens: Iterator<EvaluatorToken>,
  D?: DecimalConstructor
) {
  const it: It = new PeekableInfiniteIterator(fillEnd(tokens, EOF));
  const result = evaluateAddSub(it, D);
  if (it.next().value !== EOF) throw new Error("Unexpected token");
  return result;
}

const EOF = { type: "EOF" } as const;
type It = PeekableInfiniteIterator<EvaluatorToken | typeof EOF>;

type Evaluator = (it: It, D?: DecimalConstructor) => Decimal;
type Operation = (left: Decimal, right: Decimal) => Decimal;
function binaryEvaluator(
  tokens: Map<TokenizerToken, (left: Decimal, right: Decimal) => Decimal>,
  inner: Evaluator
): Evaluator {
  return function (it, D) {
    let left = inner(it, D);
    for (let op; (op = tokens.get(it.peek() as TokenizerToken)); ) {
      it.next();
      left = op(left, inner(it, D));
    }
    return left;
  };
}

const evaluateAddSub = binaryEvaluator(
  new Map<TokenizerToken, Operation>([
    [Tokens.Plus, (l, r) => l.add(r)],
    [Tokens.Minus, (l, r) => l.subtract(r)],
  ]),
  binaryEvaluator(
    new Map<TokenizerToken, Operation>([
      [Tokens.Mul, (l, r) => l.times(r)],
      [Tokens.Div, (l, r) => l.divide(r)],
    ]),
    evaluateUnary
  )
);


function evaluateUnary(it: It, D?: DecimalConstructor): Decimal {
  switch (it.peek()) {
    case Tokens.Plus:
      it.next();
      return evaluateUnary(it, D);
    case Tokens.Minus:
      it.next();
      return evaluateUnary(it, D).times(
        D == null ? new globalThis.Decimal("-1") : new D("-1")
      );
    default:
      return evaluatePrimary(it, D);
  }
}

function evaluatePrimary(it: It, D?: DecimalConstructor): Decimal {
  const tok = it.next().value;
  switch (tok) {
    case Tokens.LParen: {
      it.next();
      const result = evaluateAddSub(it, D);
      if (it.next().value !== Tokens.RParen) throw new Error("Expected )");
      return result;
    }
    default:
      if (tok.type === "Number") {
        return D == null ? new globalThis.Decimal(tok.value) : new D(tok.value);
      } else if (tok.type === "Value") {
        return tok.value;
      } else {
        throw new Error("Expected Number or LParen, found " + tok.type);
      }
  }
}
