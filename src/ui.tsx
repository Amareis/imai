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

const ScrollableText = (
  { lines, dim = false }: {
    lines: string[];
    dim?: boolean;
  },
) => {
  return (
    <ScrollView>
      {lines.map((line: string) => (
        dim ? <Text style={{ dim: true }}>{line}</Text> : <Text>{line}</Text>
      ))}
    </ScrollView>
  );
};

export const App = observer(() => {
  const { exit, rows, columns } = useApp();

  useEffect(() => {
    store.init();
  }, []);

  const { thinkingLines, contextLines, outputLines } = store;

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

      {/* Thinking */}
      {thinkingLines.length > 0 && (
        <Box
          style={{
            border: "single",
            borderColor: "magenta",
            paddingX: 1,
            flexBasis: 10,
            flexGrow: 1,
          }}
        >
          <Text style={{ bold: true, color: "magenta" }}>THINKING</Text>
          {thinkingLines.slice(-3).map((l: string) => (
            <Text>{l.slice(0, 80)}</Text>
          ))}
        </Box>
      )}

      {/* Context Panel */}
      <Box
        style={{
          border: "single",
          borderColor: "blue",
          flexBasis: 10,
          flexGrow: 1,
        }}
      >
        <Text style={{ bold: true, color: "blue" }}>
          CONTEXT
        </Text>
        <ScrollableText
          lines={contextLines}
          dim
        />
      </Box>

      {/* Output Panel */}
      <Box
        style={{
          flexDirection: "column",
          border: "single",
          borderColor: "green",
          flexBasis: 10,
          flexGrow: 1,
        }}
      >
        <Text style={{ bold: true, color: "green" }}>
          OUTPUT [Ctrl+O]
        </Text>
        <ScrollableText
          lines={outputLines}
        />
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
        )
      </Box>

      {/* Last log */}
      <Box>
        <Text style={{ dim: true }}>{store.logs.slice(-1)[0] || ""}</Text>
      </Box>
    </Box>
  );
});
