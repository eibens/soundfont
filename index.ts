// This triple-slash directive is needed to use the DOM.
/// <reference lib="dom"/>

import * as Gleitz from "./gleitz.ts";
import { load } from "./load.ts";

// Reload the page whenever a WebSocket message is received.
new WebSocket("ws://localhost:1234")
  .addEventListener("message", () => window.location.reload());

type State = {
  keys: string[];
  play?: (key: string) => void;
  stop?: (key: string) => void;
};

const css = `
:root {
  --background-color: #111;
}

html {
  background: var(--background-color);
  font-size: 16px;
  font-family: "JetBrains Mono", monospace;
}

body {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
}

.piano {
  flex: 1;
  flex-direction: column;
  display: flex;
  align-items: stretch;
}

.nav {
  pointer-events: none;
  background: linear-gradient(var(--background-color), transparent);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem 2rem;
}

.nav h1 {
  color: white;
  font-size: 1.25rem;
  font-weight: normal;
}

.key-list {
  flex: 1;
  display: flex;
  list-style: none;
  align-items: stretch;
  justify-content: stretch;
  margin: 0;
  padding: 0.25rem;
}

.key-item {
  flex: 1;
  display: flex;
}

.key {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 0.25rem;
  background: linear-gradient(transparent, white);
  border-radius: 0.5rem;
  border: none;
  font-size: 1rem;
  font-family: inherit;
  color: var(--background-color);
  transition: opacity 0.25s, background 0.5s;
  padding-bottom: 1rem;
}

.key:hover {
  background: linear-gradient(transparent, #B2EBF2);
}

.key:focus {
  font-weight: bold;
  outline: none;
}

.key.pressed {
  background: linear-gradient(transparent, #26C6DA);
}

.piano.loading .key {
  pointer-events: none;
  opacity: 0.25;
}
`;

function initPage() {
  const viewport = document.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width";
  document.head.appendChild(viewport);

  const styleContent = document.createTextNode(css);
  const style = document.createElement("style");
  style.appendChild(styleContent);
  document.head.appendChild(style);
}

function createGui(options: State) {
  const piano = document.createElement("div");
  piano.classList.add("piano");
  piano.classList.add("loading");

  const nav = document.createElement("nav");
  nav.classList.add("nav");
  piano.appendChild(nav);

  const title = document.createElement("h1");
  title.appendChild(new Text("🎹 virtual piano"));
  nav.appendChild(title);

  const keyList = document.createElement("ol");
  keyList.classList.add("key-list");
  piano.appendChild(keyList);

  options.keys.forEach((key) => {
    const item = document.createElement("li");
    item.classList.add("key-item");

    const label = document.createTextNode(key);
    const button = document.createElement("button");

    function startNote() {
      if (!options.play) return;
      options.play(key);
      button.classList.add("pressed");
    }
    function stopNote() {
      if (!options.stop) return;
      options.stop(key);
      button.classList.remove("pressed");
    }

    button.addEventListener("mousedown", startNote);
    button.addEventListener("touchstart", startNote);
    button.addEventListener("mouseup", stopNote);
    button.addEventListener("touchend", stopNote);

    button.classList.add("key");

    button.appendChild(label);
    item.appendChild(button);
    keyList.appendChild(item);
  });

  return piano;
}

async function createPiano() {
  const ac = new AudioContext();
  const url = Gleitz.getUrl();
  const font = await load(ac, url);
  const pressed = new Map<string, {
    node: AudioBufferSourceNode;
    gain: GainNode;
  }>();
  return {
    stop(key: string) {
      const note = pressed.get(key);
      if (!note) return;

      const release = 0.125;
      const now = ac.currentTime;
      note.gain.gain.setValueAtTime(1, now);
      note.gain.gain.linearRampToValueAtTime(0, now + release);
      setTimeout(() => {
        note.gain.disconnect();
      }, release * 1000);
    },
    play(key: string) {
      if (!font[key]) {
        console.error("error: unknown key " + key);
        return;
      }
      this.stop(key);

      const gain = ac.createGain();
      gain.gain.setValueAtTime(1, ac.currentTime);
      gain.connect(ac.destination);

      const node = ac.createBufferSource();
      node.buffer = font[key];
      node.connect(gain);

      node.start();
      pressed.set(key, {
        node,
        gain,
      });
    },
  };
}

const state: State = {
  keys: "C4 D4 E4 F4 G4 A4 B4 C5".split(" "),
};

initPage();
const root = createGui(state);
document.body.appendChild(root);
createPiano().then(({ play, stop }) => {
  state.play = play;
  state.stop = stop;
  root.classList.remove("loading");
});
