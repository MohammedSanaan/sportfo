import { assertEquals } from "jsr:@std/assert";
import { normalizeHookPhone } from "./phone.ts";

Deno.test("normalizeHookPhone adds a leading + when Supabase's hook payload omits it", () => {
  assertEquals(normalizeHookPhone("97455512345"), "+97455512345");
  assertEquals(normalizeHookPhone("919812345678"), "+919812345678");
});

Deno.test("normalizeHookPhone leaves an already-prefixed number unchanged", () => {
  assertEquals(normalizeHookPhone("+97455512345"), "+97455512345");
});
