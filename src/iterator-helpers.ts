export class PeekableInfiniteIterator<T> implements Iterator<T, never> {
  #iterator: Iterator<T, never, void>;
  #current: T;

  constructor(iterator: Iterator<T, never, void>) {
    this.#iterator = iterator;
    this.#current = iterator.next().value;
  }

  peek() {
    return this.#current;
  }

  next() {
    const result = this.#current;
    this.#current = this.#iterator.next().value;
    return { value: result, done: false as const };
  }
}

export function* map<T, U>(
  iterator: Iterator<T>,
  fn: (value: T) => U
): IterableIterator<U> {
  let value;
  while (!({ value } = iterator.next()).done) yield fn(value);
}

export function* intersperse<T, U>(
  iterators: Iterator<Iterator<T>>,
  separators: Iterator<U>
): IterableIterator<T | U> {
  let first = true;
  let it, value;
  while (!({ value: it } = iterators.next()).done) {
    if (!first) yield separators.next().value;
    first = false;
    while (!({ value } = it.next()).done) {
      yield value;
    }
  }
}

export function* fillEnd<T, U>(
  iterator: Iterator<T>,
  end: U
): Generator<T | U, never> {
  let value;
  while (!({ value } = iterator.next()).done) yield value;
  while (true) yield end;
}
