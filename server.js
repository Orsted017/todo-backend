// server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Настройка подключения к базе данных PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// GET — получить все задачи
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка при получении данных' });
  }
});

// POST — создать новую задачу
app.post('/todos', async (req, res) => {
  console.log('Keldi:', req.body); // 👈 log qo‘shildi

  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Text is required' }); // Ingilizcha qilib, frontendga tushunarliroq
  }

  try {
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error on insert' });
  }
});


// DELETE — удалить задачу по id
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    res.json({ message: 'Удалено успешно' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка при удалении' });
  }
});

// Запуск сервера
app.listen(PORT, () => console.log(`✅ Сервер запущен: http://localhost:${PORT}`));
