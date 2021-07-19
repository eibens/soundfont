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
};

const css = `
html {
  background: #222;
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
  background: #222;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.5);
  padding: 0.5rem 1rem;
}

.key-list {
  flex: 1;
  display: flex;
  list-style: none;
  align-items: stretch;
  justify-content: stretch;
  margin: 0;
  padding: 1rem;
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
  font-size: 1.5rem;
  font-family: inherit;
  color: rgba(0, 0, 0, 0.75);
  transition: opacity 0.25s;
  padding-bottom: 1rem;
}

.piano.loading .key {
  pointer-events: none;
  opacity: 0.25;
}

.nav h1 {
  color: white;
  font-size: 1.5rem;
  font-weight: normal;
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
    button.addEventListener("click", () => {
      if (!options.play) return;
      options.play(key);
    });
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
  return (str: string) => {
    if (!font[str]) {
      console.error("error: unknown key " + str);
      return;
    }
    const node = ac.createBufferSource();
    node.buffer = font[str];
    node.connect(ac.destination);
    node.start();
  };
}

const state: State = {
  keys: "C4 D4 E4 F4 G4 A4 B4 C5".split(" "),
};

initPage();
const root = createGui(state);
document.body.appendChild(root);
createPiano().then((play) => {
  state.play = play;
  root.classList.remove("loading");
});
