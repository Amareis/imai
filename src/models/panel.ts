import {
  getRootStore,
  idProp,
  Model,
  model,
  modelAction,
  prop,
} from "mobx-keystone";
import type { Session } from "../session.ts";

export type PanelState = "minimized" | "preview" | "expanded";

@model("imai/BasePanel")
export class BasePanel extends Model({
  id: idProp,
  slug: prop<string>(),
  state: prop<PanelState>("preview"),
}) {
  @modelAction
  setState(s: PanelState) {
    this.state = s;
  }

  @modelAction
  toggle() {
    this.state = this.state === "expanded" ? "minimized" : "expanded";
  }

  protected override onAttachedToRootStore(): () => void {
    const session = getRootStore<Session>(this);
    if (session && !session.panels.includes(this)) {
      session.registerPanel(this);
    }
    return () => {};
  }

  renderForModel(): string {
    const type = this.$modelType.replace("imai/", "");
    if (this.state === "minimized") {
      return `[${type}:${this.slug}]`;
    }
    return `=== ${type}:${this.slug} ===`;
  }

  getAPI(): Record<string, unknown> {
    return {
      setState: this.setState.bind(this),
      toggle: this.toggle.bind(this),
    };
  }
}
