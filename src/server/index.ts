import express from "express";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../database.types";
import tmi from "tmi.js";
import morgan from "morgan";
import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

const client = new tmi.Client({
  channels: ["paymoneywubby"],
});
client.connect();

const httpServer = createServer(app);

// Create a new Socket.IO instance
const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5173",
  },
});

// Define a function to handle new WebSocket connections
io.on("connection", (socket) => {
  console.log("New WebSocket connection established!");

  client.on("message", async (_channel, tags, message, _self) => {
    const change = messageCounter(message);

    if (change === 0) {
      return;
    }
    console.log(`${tags["display-name"]}: ${message}`);
    await supabase.from("chat").insert({
      created_at: new Date().toUTCString(),
      username: tags["display-name"] || "",
      message: message,
      value: change,
    });
    socket.emit("change", change);
  });
  app.post("/api/count/add", (_req, res) => {
    socket.emit("change", 2);
    console.log("add 2");
    res.send("2");
  });
  app.post("/api/count/subtract", (_req, res) => {
    socket.emit("change", -2);
    console.log("subtract 2");
    res.send("-2");
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("Client disconnected!");
  });
});

// using morgan for logs
app.use(morgan("combined"));

app.get("/api/count/total", async (_req, res) => {
  const { data, error } = await supabase
    .from("chat")
    .select("value", { count: "exact" })
    .select("value");
  if (error) {
    console.error("Error fetching total value:", error);
  } else if (data) {
    const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

    res.send(total.toString());
  }
});

httpServer.listen(port, () => {
  console.log("Server listening on port", port);
});

function messageCounter(message: string): number {
  if (message.trim().startsWith("+2")) {
    return 2;
  }
  if (message.trim().startsWith("-2")) {
    return -2;
  }
  return 0;
}
