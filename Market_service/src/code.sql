-- База данных создана в SQL Shell через такие команды:

-- Создание базы данных market
-- CREATE DATABASE market

-- -- Таблица товаров
-- CREATE TABLE products (
--   id SERIAL PRIMARY KEY,
--   plu VARCHAR(50) UNIQUE NOT NULL,
--   name VARCHAR(255) NOT NULL
-- );

-- -- Таблица остатков
-- CREATE TABLE stock (
--   id SERIAL PRIMARY KEY,
--   product_id INT REFERENCES products(id),
--   store_id INT REFERENCES store(id),  
--   quantity_on_shelf INT NOT NULL,
--   quantity_in_order INT NOT NULL
-- );

-- -- Таблица истории действий
-- CREATE TABLE actions (
--   id SERIAL PRIMARY KEY,
--   action VARCHAR(50) NOT NULL,
--   product_id INT REFERENCES products(id),
--   store_id INT REFERENCES store(id), 
--   quantity_change INT NOT NULL,
--   timestamp TIMESTAMP DEFAULT NOW()
-- );

-- -- -- Таблица магазинов
-- CREATE TABLE stores (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );