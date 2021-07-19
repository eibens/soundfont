import { createLogger, html } from "https://deno.land/x/surv@v0.2.3/mod.ts";
import { cli } from "https://deno.land/x/surv@v0.2.3/cli.ts";

if (import.meta.main) {
  await cli({
    server: "https://deno.land/x/surv@v0.2.3/serve.ts",
    build: [{
      cmd: ["deno", "run", "-A", "https://deno.land/x/edcb@v0.5.1/cli.ts"],
    }],
    modules: {
      index: "./index.ts",
    },
    pages: {
      index: html({
        // TODO(surv): Replace with website title.
        title: "Your Website",
        modules: ["./index.js"],
      }),
    },
    logger: createLogger({
      // TODO(surv): Replace with name of CLI.
      name: "your website cli",
    }),
  });
}
