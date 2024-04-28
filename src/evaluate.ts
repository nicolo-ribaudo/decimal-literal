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

function evaluateAddSub(it: It, D?: DecimalConstructor): Decimal {
  const left = evaluateMulDiv(it, D);
  switch (it.peek()) {
    case Tokens.Plus:
      it.next();
      return left.add(evaluateAddSub(it, D));
    case Tokens.Minus:
      it.next();
      return left.subtract(evaluateAddSub(it, D));
    default:
      return left;
  }
}

function evaluateMulDiv(it: It, D?: DecimalConstructor): Decimal {
  const left = evaluateUnary(it, D);
  switch (it.peek()) {
    case Tokens.Mul:
      it.next();
      return left.times(evaluateUnary(it, D));
    case Tokens.Div:
      it.next();
      return left.divide(evaluateUnary(it, D));
    default:
      return left;
  }
}

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
