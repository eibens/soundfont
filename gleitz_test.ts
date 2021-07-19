import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.101.0/testing/asserts.ts";
import { formats, getUrl, packs, types } from "./gleitz.ts";

Deno.test("types contain common instruments types", () => {
  assert(types.includes("acoustic_grand_piano"));
  assert(types.includes("flute"));
  assert(types.includes("percussion"));
});
Deno.test("packs contain common instrument packs", () => {
  assert(packs.includes("MusyngKite"));
});

Deno.test("formats contains common format", () => {
  assert(formats.includes("ogg"));
});

Deno.test("getUrl makes URL", () => {
  assertEquals(
    getUrl({
      cdn: "https://example.com",
      format: "mp3",
      pack: "MusyngKite",
      type: "flute",
    }),
    "https://example.com/MusyngKite/flute-mp3.js",
  );
});

Deno.test("getUrl provides defaults", () => {
  assertEquals(
    getUrl(),
    "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-ogg.js",
  );
});
