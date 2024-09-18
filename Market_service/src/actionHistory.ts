import express from 'express';
import bodyParser from 'body-parser';
import { Pool } from 'pg';

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'market',
  password: '23E57sQl',
  port: 5432,
});

export async function logAction(
  action: string,
  product_id: number,
  store_id: number,
  quantity_change: number
) {
  await pool.query(
    'INSERT INTO actions (action, product_id, shop_id, quantity_change, timestamp) VALUES ($1, $2, $3, $4, NOW())',
    [action, product_id, store_id, quantity_change]
  );
}

app.get('/actions', async (req, res) => {
  const { store_id, plu, start_date, end_date, action, page, limit } =
    req.query;
  let query = 'SELECT * FROM actions WHERE 1=1';
  const numPage = Number(req.query.page) || 1;
  const numLimit = Number(req.query.limit) || 10;
  const params = [];
  const offset = (numPage - 1) * numLimit;

  if (store_id) {
    query += ' AND store_id = $1';
    params.push(store_id);
  }
  if (plu) {
    query += ' AND product_id = (SELECT id FROM products WHERE plu = $2)';
    params.push(plu);
  }
  if (start_date) {
    query += ` AND timestamp >= $${params.length + 1}`;
    params.push(start_date);
  }
  if (end_date) {
    query += ` AND timestamp <= $${params.length + 1}`;
    params.push(end_date);
  }
  if (action) {
    query += ` AND action ILIKE $${params.length + 1}`;
    params.push(`%${action}%`);
  }

  query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${
    params.length + 2
  }`;
  params.push(limit, offset);

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

app.listen(4000, () => {
  console.log('Сервер истории действий запущен на порту 4000');
});
