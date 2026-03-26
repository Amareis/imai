import { BaseObject } from "./base.ts";
import type { DecisionObjectData, LinkType } from "../types.ts";

export class DecisionObject extends BaseObject {
  decision: string;
  alternatives: string[];
  status: "active" | "superseded" | "reverted";
  supersededBy: string | null;

  constructor(
    decision: string,
    alternatives: string[] = [],
    id?: string
  ) {
    super("decision", id);
    this.decision = decision;
    this.alternatives = alternatives;
    this.status = "active";
    this.supersededBy = null;
  }

  supersede(newDecisionId: string): void {
    this.status = "superseded";
    this.supersededBy = newDecisionId;
    this.touch();
    this.recordHistory("superseded", { by: newDecisionId });
  }

  revert(): void {
    this.status = "reverted";
    this.touch();
    this.recordHistory("reverted");
  }

  reactivate(): void {
    const oldStatus = this.status;
    this.status = "active";
    this.supersededBy = null;
    this.touch();
    this.recordHistory("reactivated", { from: oldStatus });
  }

  addAlternative(alt: string): void {
    if (!this.alternatives.includes(alt)) {
      this.alternatives.push(alt);
      this.touch();
      this.recordHistory("alternative_added", { alternative: alt });
    }
  }

  override linkTo(targetId: string, relationType: LinkType): void {
    super.linkTo(targetId, relationType);
  }

  render(): string {
    const statusIcon = this.status === "active" ? "✓" :
                       this.status === "superseded" ? "→" : "✗";
    const altCount = this.alternatives.length > 0 ? ` (${this.alternatives.length} alts)` : "";
    return `[${this.id}] ${statusIcon} decision: ${this.decision.slice(0, 50)}${altCount}`;
  }

  toJSON(): DecisionObjectData {
    return {
      id: this.id,
      type: "decision",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      decision: this.decision,
      alternatives: this.alternatives,
      status: this.status,
      supersededBy: this.supersededBy,
    };
  }

  static override fromJSON(data: DecisionObjectData): DecisionObject {
    const obj = new DecisionObject(data.decision, data.alternatives, data.id);
    obj.createdAt = data.createdAt;
    obj.updatedAt = data.updatedAt;
    obj.tags = data.tags;
    obj.pinned = data.pinned;
    obj.links = data.links;
    obj.history = data.history;
    obj.status = data.status;
    obj.supersededBy = data.supersededBy;
    return obj;
  }
}
