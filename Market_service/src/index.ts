import express from 'express';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import { logAction } from './actionHistory';

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'market',
  password: '23E57sQl',
  port: 5432,
});

app.post('/product', async (req, res) => {
  const { plu, name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING *',
      [plu, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

app.post('/stock', async (req, res) => {
  const { product_id, store_id, quantity_on_shelf, quantity_in_order } =
    req.body;
  try {
    const result = await pool.query(
      `INSERT INTO stock (product_id, shop_id, quantity_on_shelf, quantity_in_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product_id, store_id, quantity_on_shelf, quantity_in_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

app.put('/stock/increase/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, store_id } = req.body;
  const numId = Number(id);

  if (isNaN(numId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const result = await pool.query(
      `UPDATE stock SET quantity_on_shelf = quantity_on_shelf + $1 WHERE id = $2 RETURNING *`,
      [amount, id]
    );
    await logAction('increase', numId, store_id, amount);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

app.put('/stock/decrease/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, store_id } = req.body;
  const numId = Number(id);

  if (isNaN(numId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const result = await pool.query(
      `UPDATE stock SET quantity_on_shelf = quantity_on_shelf - $1 WHERE id = $2 RETURNING *`,
      [amount, id]
    );
    await logAction('decrease', numId, store_id, -amount);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

app.get('/stock', async (req, res) => {
  const {
    plu,
    store_id,
    min_quantity_on_shelf,
    max_quantity_on_shelf,
    min_quantity_in_order,
    max_quantity_in_order,
  } = req.query;
  let query = 'SELECT * FROM stock WHERE 1=1';
  const params = [];

  if (plu) {
    query += ' AND product_id = (SELECT id FROM products WHERE plu = $1)';
    params.push(plu);
  }
  if (store_id) {
    query += ` AND shop_id = $${params.length + 1}`;
    params.push(store_id);
  }
  if (min_quantity_on_shelf) {
    query += ` AND quantity_on_shelf >= $${params.length + 1}`;
    params.push(min_quantity_on_shelf);
  }
  if (max_quantity_on_shelf) {
    query += ` AND quantity_on_shelf <= $${params.length + 1}`;
    params.push(max_quantity_on_shelf);
  }
  if (min_quantity_in_order) {
    query += ` AND quantity_in_order >= $${params.length + 1}`;
    params.push(min_quantity_in_order);
  }
  if (max_quantity_in_order) {
    query += ` AND quantity_in_order <= $${params.length + 1}`;
    params.push(max_quantity_in_order);
  }

  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

app.get('/products', async (req, res) => {
  const { name, plu } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (name) {
    query += ` AND name ILIKE $${params.length + 1}`;
    params.push(`%${name}%`);
  }
  if (plu) {
    query += ` AND plu = $${params.length + 1}`;
    params.push(plu);
  }

  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
