import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { store } from "./store.ts";
import {
  Box,
  Input,
  type Key,
  ScrollView,
  Text,
  useApp,
} from "@semos-labs/glyph";

export const App = observer(() => {
  const { exit, rows, columns } = useApp();

  useEffect(() => {
    store.init();
  }, []);

  const { thinkingLines, contextLines, outputLines, logLines } = store;

  const hasThinking = thinkingLines.length > 0;
  const headerHeight = 1;
  const thinkingHeight = hasThinking ? 6 : 2;
  const inputHeight = 3;
  const availableHeight = rows - headerHeight - thinkingHeight - inputHeight;

  const contextHeight = Math.floor(availableHeight * 0.4);
  const outputHeight = Math.floor(availableHeight * 0.4);
  const logsHeight = availableHeight - contextHeight - outputHeight;

  return (
    <Box
      style={{
        height: rows,
        width: columns,
      }}
    >
      {/* Header */}
      <Box style={{ flexDirection: "row" }}>
        <Text
          style={{
            color: store.error ? "red" : store.isLoading ? "yellow" : "green",
          }}
        >
          {store.status}
        </Text>
        {store.error && (
          <Text style={{ color: "red" }}>| {store.error.slice(0, 50)}</Text>
        )}
      </Box>

      {/* Context Panel */}
      <Box
        style={{
          border: "single",
          borderColor: "blue",
          height: contextHeight,
        }}
      >
        <Text style={{ bold: true, color: "blue" }}>CONTEXT</Text>
        <ScrollView style={{ flexGrow: 1 }}>
          {contextLines.map((l: string) => (
            <Text style={{ dim: true }}>{l}</Text>
          ))}
        </ScrollView>
      </Box>

      {/* Output Panel */}
      <Box style={{ flexDirection: "row", height: outputHeight }}>
        <Box
          style={{
            flexBasis: 1,
            flexGrow: 1,
            border: "single",
            borderColor: "green",
          }}
        >
          <Text style={{ bold: true, color: "green" }}>OUTPUT</Text>
          <ScrollView style={{ flexGrow: 1 }}>
            {outputLines.map((l: string, i) => <Text key={i}>{l}</Text>)}
          </ScrollView>
        </Box>

        <Box
          style={{
            flexBasis: 1,
            flexGrow: 1,
            border: "single",
            borderColor: "magenta",
          }}
        >
          <Text style={{ bold: true, color: "magenta" }}>THINKING</Text>
          <ScrollView style={{ flexGrow: 1 }}>
            {thinkingLines.map((l: string, i) => <Text key={i}>{l}</Text>)}
          </ScrollView>
        </Box>
      </Box>

      {/* Logs Panel */}
      <Box
        style={{
          border: "single",
          borderColor: "whiteBright",
          height: logsHeight,
        }}
      >
        <Text style={{ bold: true, color: "whiteBright" }}>LOGS</Text>
        <ScrollView style={{ flexGrow: 1 }}>
          {logLines.map((l: string, i) => (
            <Text key={i} style={{ dim: true }}>{l}</Text>
          ))}
        </ScrollView>
      </Box>

      {/* Input */}
      <Box
        style={{
          flexDirection: "row",
          border: "single",
          borderColor: "yellow",
        }}
      >
        <Text style={{ bold: true, color: "yellow" }}>{" > "}</Text>
        <Input
          style={{ flexGrow: 1 }}
          value={store.input}
          onChange={(v: string) => store.setInput(v)}
          onKeyPress={(key: Key) => {
            if (key.name !== "return") return;
            const v = store.input;

            if (v === "ai") {
              store.callAI();
            } else if (v.startsWith("send ")) {
              store.sendMessage(v.slice(5));
            } else if (v === "clear") {
              store.clearOutput();
            } else if (v === "save") {
              store.save();
            } else if (v === "quit" || v === "q") {
              store.save();
              exit();
            } else store.executeCode(v);
          }}
          placeholder="send <msg> | ai | clear | save | quit"
        />
      </Box>
    </Box>
  );
});
