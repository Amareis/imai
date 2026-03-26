import { BaseObject } from "./base.ts";
import type { DataObjectData } from "../types.ts";

export class DataObject extends BaseObject {
  data: unknown;
  schema?: Record<string, unknown>;

  constructor(
    data: unknown,
    schema?: Record<string, unknown>,
    id?: string
  ) {
    super("data", id);
    this.data = data;
    this.schema = schema;
  }

  query(fn: (item: unknown) => boolean): unknown[] {
    if (Array.isArray(this.data)) {
      return this.data.filter(fn);
    }
    if (typeof this.data === "object" && this.data !== null) {
      const result: unknown[] = [];
      for (const value of Object.values(this.data as Record<string, unknown>)) {
        if (fn(value)) {
          result.push(value);
        }
      }
      return result;
    }
    return [];
  }

  filter(fn: (item: unknown) => boolean): DataObject {
    const filtered = this.query(fn);
    return new DataObject(filtered, this.schema);
  }

  transform(fn: (data: unknown) => unknown): DataObject {
    const transformed = fn(this.data);
    return new DataObject(transformed, this.schema);
  }

  set(newData: unknown): void {
    this.data = newData;
    this.touch();
    this.recordHistory("set", { type: typeof newData });
  }

  setSchema(schema: Record<string, unknown>): void {
    this.schema = schema;
    this.touch();
    this.recordHistory("schema_set");
  }

  render(): string {
    const preview = this.renderPreview();
    return `[${this.id}] data: ${preview}`;
  }

  private renderPreview(): string {
    if (Array.isArray(this.data)) {
      return `Array(${this.data.length})`;
    }
    if (typeof this.data === "object" && this.data !== null) {
      const keys = Object.keys(this.data as Record<string, unknown>);
      return `Object(${keys.length} keys)`;
    }
    return String(this.data).slice(0, 50);
  }

  toJSON(): DataObjectData {
    return {
      id: this.id,
      type: "data",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      data: this.data,
      schema: this.schema,
    };
  }

  static fromJSON(data: DataObjectData): DataObject {
    const obj = new DataObject(data.data, data.schema, data.id);
    obj.createdAt = data.createdAt;
    obj.updatedAt = data.updatedAt;
    obj.tags = data.tags;
    obj.pinned = data.pinned;
    obj.links = data.links;
    obj.history = data.history;
    return obj;
  }
}
