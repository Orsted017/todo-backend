const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let todos = [];
let id = 1;

// Получить все задачи
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Создать новую задачу
app.post('/todos', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const todo = { id: id++, text };
  todos.push(todo);
  res.status(201).json(todo);
});

// Удалить задачу по id
app.delete('/todos/:id', (req, res) => {
  const todoId = Number(req.params.id);
  todos = todos.filter(todo => todo.id !== todoId);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Server is running");
});
