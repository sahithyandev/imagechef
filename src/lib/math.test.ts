import { expect, test } from "bun:test";
import { round } from "@/lib/math";

test("rounds values to a requested decimal precision", () => {
  expect(round(12.5)).toBe(13);
  expect(round(1.005, 2)).toBe(1.01);
  expect(round(-1.005, 2)).toBe(-1.01);
  expect(round(1_234, -2)).toBe(1_200);
});
