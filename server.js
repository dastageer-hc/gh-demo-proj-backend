const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend to connect
    methods: ["GET", "POST"],
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

async function getTodos() {
  const { data, error } = await supabase.from("todos").select("*");
  if (error) console.error("Error fetching todos:", error);
  return data;
}

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Send initial todos when a client connects
  getTodos().then((todos) => socket.emit("update", todos));

  // Listen for new todo addition
  socket.on("newTodo", async () => {
    console.log("New todo added");
    const todos = await getTodos();
    io.emit("update", todos); // Broadcast updated todos
  });

  // Listen for todo deletion
  socket.on("deleteTodo", async () => {
    console.log("Todo deleted");
    const todos = await getTodos();
    io.emit("update", todos); // Broadcast updated todos
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3200, () => console.log("🚀 Server running on port 5000"));
