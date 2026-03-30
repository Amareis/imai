import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { store } from "./store.ts";
import {
  Box,
  Input,
  type Key,
  Keybind,
  Portal,
  ScrollView,
  Text,
  useApp,
  useInput,
} from "@semos-labs/glyph";
import { abort } from "node:process";

const COLUMN_WIDTH = 50;

export const Content = observer(({ rows, columns }: {
  rows: number;
  columns: number;
}) => {
  if (store.debugMode) {
    return (
      <Box style={{ flexDirection: "column", height: rows }}>
        <ScrollView style={{ flexGrow: 1 }}>
          <Text style={{ color: "whiteBright" }}>
            {store.contextLines.join("\n")}
          </Text>
        </ScrollView>
      </Box>
    );
  }

  const panels = store.session?.panels ?? [];
  const numColumns = Math.max(1, Math.floor(columns / COLUMN_WIDTH));
  const rowsPerColumn = Math.ceil(panels.length / numColumns);
  const panelHeight = Math.floor(rows / Math.max(1, rowsPerColumn));

  const columnsData: typeof panels[] = [];
  for (let i = 0; i < numColumns; i++) {
    columnsData.push([]);
  }
  panels.forEach((panel, i) => {
    columnsData[i % numColumns].push(panel);
  });

  return (
    <Box style={{ flexDirection: "row", height: rows }}>
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
  );
});

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

  const inputHeight = 5;
  const availableHeight = rows - inputHeight;

  return (
    <Box style={{ height: rows, width: columns, flexDirection: "column" }}>
      <Keybind keypress="ctrl+l" onPress={() => store.toggleLogs()} priority />

      <Content columns={columns} rows={availableHeight} />

      <Box
        style={{
          height: inputHeight,
          border: "single",
          borderColor: "yellow",
        }}
      >
        <Box style={{ flexDirection: "row" }}>
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

        <Box style={{ paddingTop: 1, flexDirection: "row" }}>
          <Text
            style={{
              color: store.error ? "red" : store.isLoading ? "yellow" : "green",
            }}
          >
            {"   "}
            {store.status}
          </Text>
          <Text style={{ dim: true }}>
            {" | "}Ctrl+D debug | Ctrl+L logs
          </Text>
          {store.error && (
            <Text style={{ color: "red" }}>
              {" | "}
              {store.error.slice(0, 30)}
            </Text>
          )}
        </Box>
      </Box>

      {store.logVisible && (
        <Portal>
          <Box
            style={{
              padding: 1,
              position: "absolute",
              top: 0,
              left: 0,
              width: columns,
              height: rows,
              bg: "black",
              flexDirection: "column",
            }}
          >
            <Box style={{ flexDirection: "row" }}>
              <Text style={{ bold: true, color: "yellow" }}>LOGS</Text>
              <Text style={{ dim: true }}>| Ctrl+L to close</Text>
            </Box>
            <ScrollView style={{ flexGrow: 1 }}>
              <Text style={{ color: "whiteBright", dim: true }}>
                {store.logs.join("\n")}
              </Text>
            </ScrollView>
          </Box>
        </Portal>
      )}
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
