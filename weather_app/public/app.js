document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('citySelect');
    const fetchBtn = document.getElementById('fetchBtn');
    const weatherDisplay = document.getElementById('weatherDisplay');
    const weatherContent = document.getElementById('weatherContent');
    const historyContent = document.getElementById('historyContent');
    const historyTableBody = document.getElementById('historyTableBody');
    const loader = document.getElementById('loader');
    const errorDisplay = document.getElementById('errorDisplay');

    const tempValue = document.getElementById('tempValue');
    const feelsLikeValue = document.getElementById('feelsLikeValue');
    const conditionValue = document.getElementById('conditionValue');
    const humidityValue = document.getElementById('humidityValue');
    const windSpeedValue = document.getElementById('windSpeedValue');

    citySelect.addEventListener('change', () => {
        if (citySelect.value) {
            fetchBtn.disabled = false;
        } else {
            fetchBtn.disabled = true;
        }
    });

    fetchBtn.addEventListener('click', async () => {
        const city = citySelect.value;
        if (!city) return;

        const mode = document.querySelector('input[name="dataMode"]:checked').value;

        weatherDisplay.style.display = 'block';
        weatherContent.style.display = 'none';
        historyContent.style.display = 'none';
        errorDisplay.style.display = 'none';
        loader.style.display = 'block';

        try {
            if (mode === 'current') {
                const response = await fetch(`/api/weather/${city}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Ошибка при получении данных');
                }
                const fact = data.fact;

                tempValue.textContent = `${fact.temp} °C`;
                feelsLikeValue.textContent = `${fact.feels_like} °C`;
                conditionValue.textContent = fact.condition;
                humidityValue.textContent = `${fact.humidity} %`;
                windSpeedValue.textContent = `${fact.wind_speed} м/с`;

                loader.style.display = 'none';
                weatherContent.style.display = 'block';
            } else {
                const response = await fetch(`/api/history/${city}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Ошибка при получении данных');
                }
                
                historyTableBody.innerHTML = '';
                data.history.forEach(day => {
                    const tr = document.createElement('tr');
                    const d = new Date(day.date);
                    const formattedDate = d.toLocaleDateString('ru-RU');
                    
                    tr.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${day.temp} °C</td>
                        <td>${day.humidity}%</td>
                        <td>${day.wind_speed} м/с</td>
                    `;
                    historyTableBody.appendChild(tr);
                });

                loader.style.display = 'none';
                historyContent.style.display = 'block';
            }

        } catch (error) {
            console.error('Fetch error:', error);
            loader.style.display = 'none';
            errorDisplay.textContent = error.message;
            errorDisplay.style.display = 'block';
        }
    });
});
