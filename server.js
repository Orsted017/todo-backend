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
        console.log('INFO: Запрос GET /todos получен'); // Qo'shimcha informatsiya
        const result = await pool.query('SELECT * FROM todos ORDER BY id DESC');
        res.json(result.rows);
        console.log('INFO: Запрос GET /todos успешно выполнен'); // Qo'shimcha informatsiya
    } catch (err) {
        console.error('ERROR: Ошибка при получении данных -', err.message);
        console.error('ERROR Details:', err); // Тўлиқ хато объектини чиқариш
        res.status(500).json({ error: 'Ошибка при получении данных' });
    }
});

// POST — создать новую задачу
app.post('/todos', async (req, res) => {
    const { title } = req.body;
    console.log('INFO: Запрос POST /todos получен с данными:', req.body); // Qo'shimcha informatsiya
    if (!title) {
        console.error('WARNING: Поле title обязательно, но отсутствует');
        return res.status(400).json({ error: 'Поле title обязательно' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO todos (title) VALUES ($1) RETURNING *',
            [title]
        );
        res.status(201).json(result.rows[0]);
        console.log('INFO: Задача успешно добавлена:', result.rows[0]); // Qo'shimcha informatsiya
    } catch (err) {
        console.error('ERROR: Ошибка при добавлении данных -', err.message);
        console.error('ERROR Details:', err); // Тўлиқ хато объектини чиқариш
        res.status(500).json({ error: 'Ошибка при добавлении данных' });
    }
});

// DELETE — удалить задачу по id
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    console.log('INFO: Запрос DELETE /todos/' + id + ' получен'); // Qo'shimcha informatsiya
    try {
        const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            console.warn('WARNING: Задача с ID ' + id + ' не найдена');
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        res.json({ message: 'Удалено успешно' });
        console.log('INFO: Задача с ID ' + id + ' успешно удалена'); // Qo'shimcha informatsiya
    } catch (err) {
        console.error('ERROR: Ошибка при удалении -', err.message);
        console.error('ERROR Details:', err); // Тўлиқ хато объектини чиқариш
        res.status(500).json({ error: 'Ошибка при удалении' });
    }
});

// Запуск сервера
app.listen(PORT, () => console.log(`✅ Сервер запущен: http://localhost:${PORT}`));