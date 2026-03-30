import {
  getRootStore,
  idProp,
  Model,
  model,
  modelAction,
  prop,
} from "mobx-keystone";
import type { Session } from "../session.ts";

export type PanelState = "minimized" | "expanded";

@model("imai/BasePanel")
export class BasePanel extends Model({
  id: idProp,
  slug: prop<string>(),
  state: prop<PanelState>("expanded"),
  system: prop<boolean>(() => false),
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

  get isExpanded() {
    return this.state === "expanded";
  }

  get isMinimized() {
    return this.state === "minimized";
  }

  get text(): string {
    return "";
  }

  renderForModel(): string {
    const type = this.$modelType.replace("imai/", "");
    const text = this.text;
    if (this.state === "minimized") {
      return `[${type}:${this.slug} - MINIMIZED]${text ? ": " + text : ""}`;
    }
    return `=== ${type}:${this.slug} ===${text ? "\n" + text : ""}`;
  }

  getAPI(): Record<string, unknown> {
    return {
      setState: this.setState.bind(this),
      toggle: this.toggle.bind(this),
    };
  }
}
