CREATE TABLE IF NOT EXISTS weather_history (
    id SERIAL PRIMARY KEY,
    city VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    temp INT NOT NULL,
    feels_like INT NOT NULL,
    condition VARCHAR(50) NOT NULL,
    humidity INT NOT NULL,
    wind_speed NUMERIC(4, 1) NOT NULL
);

-- Generate mock data for the last 10 days
DO $$
DECLARE
    cities TEXT[] := ARRAY['moscow', 'spb', 'novosibirsk', 'rostov'];
    conditions TEXT[] := ARRAY['clear', 'cloudy', 'overcast', 'rain', 'snow'];
    i INT;
    c TEXT;
    dt DATE;
BEGIN
    FOR c IN SELECT unnest(cities) LOOP
        FOR i IN 1..10 LOOP
            dt := CURRENT_DATE - i;
            INSERT INTO weather_history (city, date, temp, feels_like, condition, humidity, wind_speed)
            VALUES (
                c,
                dt,
                (random() * 30 - 10)::INT, -- random temp between -10 and +20
                (random() * 30 - 12)::INT, 
                conditions[1 + (random() * 4)::INT],
                (random() * 50 + 50)::INT, -- humidity 50-100%
                (random() * 10)::NUMERIC(4, 1) -- wind 0-10
            );
        END LOOP;
    END LOOP;
END $$;
