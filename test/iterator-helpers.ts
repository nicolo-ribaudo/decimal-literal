import { intersperse } from "../src/iterator-helpers.ts";

import { test } from "node:test";
import assert from "node:assert";

test("#1", () => {
  const a = [1];
  const b = ["a", "b", "c"];
  const c = ["x", "y", "z"];
  const it = intersperse(
    [b.values(), c.values()].values(),
    a.values()
  );
  assert.deepEqual([...it], [...b, a[0], ...c]);
})
