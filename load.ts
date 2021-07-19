/// <reference lib="dom"/>

import loadAudio from "https://cdn.skypack.dev/pin/audio-loader@v1.0.3-CokSVbmyLFozucSZSxQG/mode=imports/optimized/audio-loader.js";

/**
 * Defines a sound font as a record of AudioBuffers.
 */
export type SoundFont = Record<PropertyKey, AudioBuffer>;

/**
 * Loads a MIDI.js soundfont.
 *
 * @param ac is the audio context.
 * @param url is the URL of a MIDI.js sound font file.
 * @returns a record of audio buffers.
 * @throws if the URL does not resolve to a valid file.
 */
export async function load(
  ac: AudioContext,
  url: string,
): Promise<SoundFont> {
  // Ensure the audio is loaded as a map from pitch to buffers.
  const audio: AudioBuffer | SoundFont = (
    await loadAudio(url, { context: ac })
  );
  if (audio instanceof AudioBuffer) {
    throw new Error("url seems to point to a single audio file");
  }
  return audio;
}
