// server.js
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3200;

app.use(cors());
app.use(express.json()); 

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Fetch all todos
app.get("/todos", async (req, res) => {
  const { data, error } = await supabase.from("todos").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add a new todo
app.post("/todos", async (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: "Task is required" });
  const { data, error } = await supabase
    .from("todos")
    .insert([{ task, completed: false }])
    .select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Todo deleted" });
});

// Toggle completion status
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const { error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Todo updated" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
