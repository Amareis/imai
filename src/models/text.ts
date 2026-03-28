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

  override renderForModel(): string {
    const type = this.$modelType.replace("imai/", "");
    if (this.state === "minimized") {
      const lines = this.content.split("\n").length;
      return `[${type}:${this.slug} - ${lines} lines]`;
    }
    return `=== ${type}:${this.slug} ===\n${this.content || "(empty)"}`;
  }
}
