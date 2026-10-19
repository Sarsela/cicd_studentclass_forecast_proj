require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'mysecret',
    database: process.env.DB_NAME || 'postgres',
    port: process.env.DB_PORT || 5432,
});

app.use(express.static(path.join(__dirname, 'public')));

const CITIES = {
    moscow: { lat: 55.7558, lon: 37.6173 },
    spb: { lat: 59.9343, lon: 30.3351 },
    novosibirsk: { lat: 55.0084, lon: 82.9357 },
    rostov: { lat: 47.2313, lon: 39.7233 }
};

app.get('/api/weather/:city', async (req, res) => {
    try {
        const cityKey = req.params.city.toLowerCase();
        const coords = CITIES[cityKey];

        if (!coords) {
            return res.status(404).json({ error: 'City not found' });
        }

        const apiKey = process.env.YANDEX_API_KEY;
        const url = `https://api.weather.yandex.ru/v2/forecast?lat=${coords.lat}&lon=${coords.lon}`;

        // Используем встроенный в Node.js нативный fetch
        const response = await fetch(url, {
            headers: { 'X-Yandex-Weather-Key': apiKey }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Yandex API status: ${response.status} - ${errText}`);
        }

        const data = await response.json();

        if (!data.fact) {
            throw new Error('Unexpected API response format: missing fact');
        }

        // Отдаем весь объект fact на фронтенд
        res.json({ fact: data.fact });

    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/history/:city', async (req, res) => {
    try {
        const cityKey = req.params.city.toLowerCase();
        if (!CITIES[cityKey]) {
            return res.status(404).json({ error: 'City not found' });
        }

        const query = 'SELECT * FROM weather_history WHERE city = $1 ORDER BY date DESC LIMIT 10';
        const { rows } = await pool.query(query, [cityKey]);
        
        res.json({ history: rows });
    } catch (error) {
        console.error('Error fetching history from DB:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = { app, CITIES, pool };
