import { expect, test } from "bun:test";
import { cn } from "@/lib/cn";

test("merges Tailwind utility classes", () => {
  expect(cn("px-2", "px-4")).toBe("px-4");
});
