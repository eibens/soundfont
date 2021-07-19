import { assert } from "https://deno.land/std@0.101.0/testing/asserts.ts";
import { render } from "./mod.ts";

// TODO(surv): Write tests for the core functionality of your website.

Deno.test("render", () => {
  assert(render().match("website"));
});
