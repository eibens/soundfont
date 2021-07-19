// This triple-slash directive is needed to use the DOM.
/// <reference lib="dom"/>

import { render } from "./mod.ts";

// Reload the page whenever a WebSocket message is received.
new WebSocket("ws://localhost:1234")
  .addEventListener("message", () => window.location.reload());

// TODO(surv): Add custom UI logic.
document.body.innerHTML = render();
