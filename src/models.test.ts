import { assertEquals } from "@std/assert";
import { Session } from "./session.ts";
import { MindPanel } from "./models/mind.ts";
import { ChatPanel } from "./models/chat.ts";

Deno.test("Session - create and basic operations", () => {
  const session = Session.create("test_session");

  assertEquals(session.id, "test_session");
  assertEquals(session.mind.content, "");
  assertEquals(session.chat.messages.length, 0);
});

Deno.test("MindPanel - content operations", () => {
  const mind = new MindPanel({});

  mind.setContent("Hello");
  assertEquals(mind.content, "Hello");

  mind.append("World");
  assertEquals(mind.content, "Hello\nWorld");

  mind.clear();
  assertEquals(mind.content, "");
});

Deno.test("ChatPanel - message operations", () => {
  const chat = new ChatPanel({});

  chat.add("user", "Hello");
  assertEquals(chat.messages.length, 1);
  assertEquals(chat.hasNew, true);
  assertEquals(chat.messages[0].from, "user");
  assertEquals(chat.messages[0].content, "Hello");

  chat.markRead();
  assertEquals(chat.hasNew, false);

  chat.clear();
  assertEquals(chat.messages.length, 0);
});

Deno.test("Session - renderForModel", () => {
  const session = Session.create("test");

  session.mind.setContent("TASK: Test\nPHASE: init");
  session.chat.add("user", "Hello");

  const rendered = session.renderForModel();
  assertEquals(rendered.includes("=== MIND ==="), true);
  assertEquals(rendered.includes("TASK: Test"), true);
  assertEquals(rendered.includes("=== CHAT ==="), true);
  assertEquals(rendered.includes("[user] Hello"), true);
});

Deno.test("Session - serialization", () => {
  const session = Session.create("test_serialize");
  session.mind.setContent("Test content");
  session.chat.add("user", "Hi");

  const data = session.toData();
  assertEquals(data.id, "test_serialize");

  const loaded = Session.load(data as Parameters<typeof Session.load>[0]);
  assertEquals(loaded.id, "test_serialize");
  assertEquals(loaded.mind.content, "Test content");
  assertEquals(loaded.chat.messages.length, 1);
});
