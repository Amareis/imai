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
  useInput,
} from "@semos-labs/glyph";

const COLUMN_WIDTH = 50;

export const App = observer(() => {
  const { exit, rows, columns } = useApp();

  useEffect(() => {
    store.init();
  }, []);

  useInput((key: Key) => {
    if (key.ctrl && key.name === "d") {
      store.toggleDebug();
    }
  });

  const headerHeight = 1;
  const inputHeight = 3;
  const availableHeight = rows - headerHeight - inputHeight;

  if (store.debugMode) {
    return (
      <Box style={{ height: rows, width: columns, flexDirection: "column" }}>
        <Box style={{ flexDirection: "row", height: headerHeight }}>
          <Text style={{ color: "cyan", bold: true }}>DEBUG MODE</Text>
          <Text style={{ dim: true }}> | Ctrl+D to exit</Text>
          {store.error && (
            <Text style={{ color: "red" }}> | {store.error.slice(0, 30)}</Text>
          )}
        </Box>

        <ScrollView style={{ height: availableHeight, flexGrow: 1 }}>
          <Text style={{ color: "whiteBright" }}>
            {store.contextLines.join("\n")}
          </Text>
        </ScrollView>

        <Box
          style={{
            flexDirection: "row",
            height: inputHeight,
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
              handleInput(store.input, exit);
            }}
            placeholder="send <msg> | ai | clear | save | quit"
          />
        </Box>
      </Box>
    );
  }

  const panels = store.session?.panels ?? [];
  const numColumns = Math.max(1, Math.floor(columns / COLUMN_WIDTH));
  const rowsPerColumn = Math.ceil(panels.length / numColumns);
  const panelHeight = Math.floor(availableHeight / Math.max(1, rowsPerColumn));

  const columnsData: typeof panels[] = [];
  for (let i = 0; i < numColumns; i++) {
    columnsData.push([]);
  }
  panels.forEach((panel, i) => {
    columnsData[i % numColumns].push(panel);
  });

  return (
    <Box style={{ height: rows, width: columns, flexDirection: "column" }}>
      <Box style={{ flexDirection: "row", height: headerHeight }}>
        <Text
          style={{
            color: store.error ? "red" : store.isLoading ? "yellow" : "green",
          }}
        >
          {store.status}
        </Text>
        <Text style={{ dim: true }}> | Ctrl+D for debug</Text>
        {store.error && (
          <Text style={{ color: "red" }}> | {store.error.slice(0, 30)}</Text>
        )}
      </Box>

      <Box style={{ flexDirection: "row", height: availableHeight }}>
        {columnsData.map((colPanels, colIdx) => (
          <Box
            key={colIdx}
            style={{
              width: COLUMN_WIDTH,
              flexDirection: "column",
            }}
          >
            {colPanels.map((panel) => (
              <Box
                key={panel.slug}
                style={{
                  border: "single",
                  borderColor: "blue",
                  height: panelHeight,
                  flexDirection: "column",
                }}
              >
                <Text style={{ bold: true, color: "cyan" }}>
                  {panel.$modelType.replace("imai/", "")}:{panel.slug}
                </Text>
                <ScrollView style={{ flexGrow: 1 }}>
                  <Text style={{ dim: true }}>
                    {panel.renderForModel()}
                  </Text>
                </ScrollView>
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      <Box
        style={{
          flexDirection: "row",
          height: inputHeight,
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
            handleInput(store.input, exit);
          }}
          placeholder="send <msg> | ai | clear | save | quit"
        />
      </Box>
    </Box>
  );
});

function handleInput(v: string, exit: () => void) {
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
}
