import { App } from "./ui.tsx";
import { configure } from "mobx";
import { render } from "@semos-labs/glyph";

if (!Deno.stdin.isTerminal()) {
  console.error("Error: Interactive mode requires a terminal.");
  Deno.exit(1);
}

configure({ enforceActions: "never" });

render(<App />);
