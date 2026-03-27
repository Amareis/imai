import React from "react";
import { App } from "./ui.tsx";
import { configure } from "mobx";
import { withFullScreen } from "fullscreen-ink";

if (!Deno.stdin.isTerminal()) {
  console.error("Error: Interactive mode requires a terminal.");
  Deno.exit(1);
}

configure({ enforceActions: "never" });

withFullScreen(<App />).start();
