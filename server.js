import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3200;

// Use app.listen to create the HTTP server implicitly
const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

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
