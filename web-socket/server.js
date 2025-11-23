import express from "express";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const PORT = 3001;

// Serve static files (index.html + JS)
app.use(express.static("public"));

// WebSocket server for browser connections
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("✅ WebSocket client connected");
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

// Upgrade HTTP → WS
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// HTTP endpoint for Logi plugin to call
app.post("/control", (req, res) => {
  const msg = req.body; // e.g. { type: "zoom", delta: 1 }
  console.log("Received control:", msg);

  const json = JSON.stringify(msg);
  for (const ws of clients) {
    ws.send(json);
  }

  res.json({ ok: true });
});
