import React, { useEffect, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import { observer } from "mobx-react-lite";
import { store } from "./store.ts";
import { useScreenSize } from "fullscreen-ink";
import type { Key } from "ink";

const ScrollableText = (
  { lines, height, scroll, dim = false }: {
    lines: string[];
    height: number;
    scroll: number;
    dim?: boolean;
  },
) => {
  const visible = lines.slice(scroll, scroll + height);
  return (
    <Box flexDirection="column">
      {visible.map((line: string, i: number) => (
        dim ? <Text dimColor>{line}</Text> : <Text>{line}</Text>
      ))}
    </Box>
  );
};

export const App = observer(() => {
  const { exit } = useApp();
  const [contextScroll, setContextScroll] = useState(0);
  const [outputScroll, setOutputScroll] = useState(0);
  const [focus, setFocus] = useState<"input" | "context" | "output">("input");
  const { height: terminalHeight } = useScreenSize();

  useEffect(() => {
    store.init();
  }, []);

  useInput((input: string, key: Key) => {
    if (key.escape) {
      setFocus("input");
      return;
    }

    if (focus === "context") {
      if (key.upArrow) setContextScroll(Math.max(0, contextScroll - 1));
      if (key.downArrow) setContextScroll(contextScroll + 1);
      if (key.pageUp) setContextScroll(Math.max(0, contextScroll - 10));
      if (key.pageDown) setContextScroll(contextScroll + 10);
    } else if (focus === "output") {
      if (key.upArrow) setOutputScroll(Math.max(0, outputScroll - 1));
      if (key.downArrow) setOutputScroll(outputScroll + 1);
      if (key.pageUp) setOutputScroll(Math.max(0, outputScroll - 10));
      if (key.pageDown) setOutputScroll(outputScroll + 10);
    } else {
      if (!key.ctrl) return;
      if (input === "x") setFocus("context");
      if (input === "o" && store.output) setFocus("output");
    }
  });

  const contextLines = store.getContextLines();
  const outputLines = store.output.split("\n").filter((l) => l.trim());
  const thinkingLines = store.thinking.split("\n").filter((l) => l.trim());

  const contextHeight = Math.floor(terminalHeight / 2);
  const outputHeight = terminalHeight - contextHeight -
    (thinkingLines.length > 0 ? 5 : 0) - 5;

  return (
    <Box flexDirection="column" height={terminalHeight + 8}>
      {/* Header */}
      <Box>
        <Text bold color="cyan">IMAI</Text>
        <Text dimColor>|</Text>
        <Text
          color={store.error ? "red" : store.isLoading ? "yellow" : "green"}
        >
          {store.status}
        </Text>
        {store.error && <Text color="red">| {store.error.slice(0, 50)}</Text>}
      </Box>

      {/* Thinking */}
      {thinkingLines.length > 0 && (
        <Box
          borderStyle="single"
          borderColor="magenta"
          paddingX={1}
          marginBottom={1}
        >
          <Box flexDirection="column">
            <Text bold color="magenta">THINKING</Text>
            {thinkingLines.slice(-3).map((l: string, i: number) => (
              <Text>{l.slice(0, 80)}</Text>
            ))}
          </Box>
        </Box>
      )}

      {/* Context Panel */}
      <Box
        flexDirection="column"
        borderStyle={focus === "context" ? "double" : "single"}
        borderColor="blue"
        height={contextHeight}
      >
        <Text bold color="blue">
          CONTEXT {contextLines.length > contextHeight
            ? `(${contextScroll + 1}-${
              Math.min(contextScroll + contextHeight, contextLines.length)
            }/${contextLines.length})`
            : ""} [Ctrl+X]
        </Text>
        <ScrollableText
          lines={contextLines}
          height={contextHeight - 2}
          scroll={contextScroll}
          dim
        />
      </Box>

      {/* Output Panel */}
      <Box
        flexDirection="column"
        borderStyle={focus === "output" ? "double" : "single"}
        borderColor="green"
        height={outputHeight}
      >
        <Text bold color="green">
          OUTPUT {outputLines.length > outputHeight
            ? `(${outputScroll + 1}-${
              Math.min(outputScroll + outputHeight, outputLines.length)
            }/${outputLines.length})`
            : ""} [Ctrl+O]
        </Text>
        <ScrollableText
          lines={outputLines}
          height={outputHeight - 2}
          scroll={outputScroll}
        />
      </Box>

      {/* Input */}
      <Box marginTop={1} borderStyle="single" borderColor="yellow">
        <Box marginRight={1}>
          <Text bold color="yellow">{">"}</Text>
        </Box>
        {focus === "input"
          ? (
            <TextInput
              value={store.input}
              onChange={(v: string) => store.setInput(v)}
              onSubmit={(v: string) => {
                if (v === "ai") {
                  store.callAI();
                } else if (v.startsWith("send ")) {
                  store.sendMessage(v.slice(5));
                } else if (v === "clear") {
                  store.clearOutput();
                  setOutputScroll(0);
                } else if (v === "save") {
                  store.save();
                } else if (v === "quit" || v === "q") {
                  store.save();
                  exit();
                } else store.executeCode(v);
              }}
              placeholder="send <msg> | ai | clear | save | quit"
            />
          )
          : <Text dimColor>Ctrl+X/O to focus, Esc to return</Text>}
      </Box>

      {/* Last log */}
      <Box>
        <Text dimColor>{store.logs.slice(-1)[0] || ""}</Text>
      </Box>
    </Box>
  );
});
