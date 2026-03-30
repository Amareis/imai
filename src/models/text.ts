import { ExtendedModel, model, modelAction, prop } from "mobx-keystone";
import { BasePanel } from "./panel.ts";

@model("imai/TextPanel")
export class TextPanel extends ExtendedModel(BasePanel, {
  content: prop<string>(() => ""),
}) {
  @modelAction
  setContent(text: string) {
    this.content = text;
  }

  override get text(): string {
    if (this.state === "minimized") {
      const lines = this.content.split("\n").length;
      return `${lines} lines]`;
    }
    return this.content || "(empty)";
  }
}
