export const Tokens = {
  Plus: { type: 'Plus' },
  Minus: { type: 'Minus' },
  Mul: { type: 'Mul' },
  Div: { type: 'Div' },
  LParen: { type: 'LParen' },
  RParen: { type: 'RParen' },
  Number: (value: string) => ({ type: 'Number', value } as const),
} as const;

type ToTokenType<T> = T extends (...args: any[]) => infer U ? U : T;
export type Token = ToTokenType<typeof Tokens[keyof typeof Tokens]>;

export function* tokenize(source: string): Iterator<Token, void> {
  let i = 0;
  let len = source.length;
  let numStart = -1;
  while (i < len) {
    const ch = source.charCodeAt(i);
    if (
      ch === 0x2E || // .
      (0x30 <= ch && ch <= 0x39) // 0-9
    ) {
      if (numStart === -1) numStart = i;
      i++;
      continue;
    }
    if (numStart !== -1) {
      yield Tokens.Number(source.slice(numStart, i));
      numStart = -1;
    }
    switch (ch) {
      case 0x09: // \t
      case 0x0A: // \n
      case 0x0D: // \r
      case 0x20: // space
        break;
      case 0x28: // (
        yield Tokens.LParen;
        break;
      case 0x29: // )
        yield Tokens.RParen;
        break;
      case 0x2A: // *
        yield Tokens.Mul;
        break;
      case 0x2B: // +
        yield Tokens.Plus;
        break;
      case 0x2D: // -
        yield Tokens.Minus;
        break;
      case 0x2F: // /
        yield Tokens.Div;
        break;
    }
    i++;
  }
  if (numStart !== -1) {
    yield Tokens.Number(source.slice(numStart, len));
  }
}