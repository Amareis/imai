import { assertEquals } from "@std/assert";
import { Session } from "./session.ts";
import { MindPanel } from "./models/mind.ts";
import { ChatPanel } from "./models/chat.ts";

Deno.test("Session - create and basic operations", () => {
  const session = Session.create("test_session");

  assertEquals(session.id, "test_session");
  assertEquals(session.panels.length, 4);

  const mind = session.getPanel(MindPanel, "main");
  const chat = session.getPanel(ChatPanel, "default");

  assertEquals(mind?.content, "");
  assertEquals(chat?.messages.length, 0);
});

Deno.test("MindPanel - content operations", () => {
  const mind = new MindPanel({ slug: "test" });

  mind.setContent("Hello");
  assertEquals(mind.content, "Hello");

  mind.append("World");
  assertEquals(mind.content, "Hello\nWorld");

  mind.clear();
  assertEquals(mind.content, "");
});

Deno.test("ChatPanel - message operations", () => {
  const chat = new ChatPanel({ slug: "test" });

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

  const mind = session.getPanel(MindPanel, "main");
  const chat = session.getPanel(ChatPanel, "default");

  mind.setContent("TASK: Test\nPHASE: init");
  chat.add("user", "Hello");

  const rendered = session.renderForModel();
  assertEquals(rendered.includes("MindPanel:main"), true);
  assertEquals(rendered.includes("TASK: Test"), true);
  assertEquals(rendered.includes("ChatPanel:default"), true);
  assertEquals(rendered.includes("[user] Hello"), true);
});

Deno.test("Session - serialization", () => {
  const session = Session.create("test_serialize");
  const mind = session.getPanel(MindPanel, "main");
  const chat = session.getPanel(ChatPanel, "default");

  mind.setContent("Test content");
  chat.add("user", "Hi");

  const data = session.toData();
  assertEquals(data.id, "test_serialize");

  const loaded = Session.load(data as Parameters<typeof Session.load>[0]);
  const loadedMind = loaded.getPanel(MindPanel, "main");
  const loadedChat = loaded.getPanel(ChatPanel, "default");
  assertEquals(loaded.id, "test_serialize");
  assertEquals(loadedMind?.content, "Test content");
  assertEquals(loadedChat?.messages.length, 1);
});

Deno.test("Session - getPanel with class check", () => {
  const session = Session.create("test");

  const mind = session.getPanel(MindPanel, "main");
  const chat = session.getPanel(ChatPanel, "default");

  assertEquals(mind instanceof MindPanel, true);
  assertEquals(chat instanceof ChatPanel, true);

  const wrongType = session.tryGetPanel(MindPanel, "default");
  assertEquals(wrongType, undefined);

  const wrongSlug = session.tryGetPanel(ChatPanel, "main");
  assertEquals(wrongSlug, undefined);
});
