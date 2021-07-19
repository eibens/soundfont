import typeMap from "./gleitz_types.ts";

const formatMap = {
  ogg: null,
  mp3: null,
};

const packMap = {
  "FluidR3_GM": null,
  "FatBoy": null,
  "MusyngKite": null,
};

export type Pack = keyof (typeof packMap);

export type Type = keyof (typeof typeMap);

export type Format = keyof (typeof formatMap);

/**
 * Defines a unique instrument.
 */
export type Font = {
  /**
   * The instrument pack.
   */
  pack: Pack;

  /**
   * The instrument type.
   */
  type: Type;
};

/**
 * Defines the configuration for a sound font URL.
 */
export type FontUrl = Font & {
  /**
   * Base URL of the server or content delivery network (CDN).
   */
  cdn: string;

  /**
   * The audio file format.
   */
  format: Format;
};

/**
 * Get an URL to the corresponding sound font.
 *
 * @param options is the URL configuration.
 * @returns a sound font URL.
 */
export function getUrl(options: Partial<FontUrl> = {}): string {
  const cdn = options.cdn ||
    "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages";
  const pack = options.pack || "FluidR3_GM";
  const type = options.type || "acoustic_grand_piano";
  const format = options.format || "ogg";
  return `${cdn}/${pack}/${type}-${format}.js`;
}

/**
 * A list of available instrument packs.
 */
export const packs = Object.keys(packMap) as Pack[];

/**
 * A list of available instrument types.
 */
export const types = Object.keys(typeMap) as Type[];

/**
 * A list of available audio formats.
 */
export const formats = Object.keys(formatMap) as Format[];
