// server.js  (ES Modules)
// -------------------------------------------
import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import { neon } from '@neondatabase/serverless';

// 1) .env
dotenv.config();
if (!process.env.DATABASE_URL)
  throw new Error('Missing DATABASE_URL');

// 2) Neon SQL client  (URL KHÔNG có channel_binding)
const sql = neon(process.env.DATABASE_URL);

// 3) App setup
const app = express();
app.use(express.json({ limit: '1mb' }));

// 4) CORS (tự lo OPTIONS, không cần route riêng)
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500'
];
app.use(cors({ origin: allowedOrigins }));

// 5) Routes
app.get('/api/health',  (req, res) => res.json({ status: 'ok' }));

app.post('/api/survey', async (req, res) => {
  try {
    await sql`
      INSERT INTO survey_responses (payload)
      VALUES (${JSON.stringify(req.body)}::jsonb)
    `;
    return res.json({ ok: true });
  } catch (err) {
    console.error('DB insert failed:', err);
    return res.status(500).json({ error: 'DB insert failed' });
  }
});


// 6) Start server
const PORT   = process.env.PORT ?? 3000;
const server = app.listen(PORT, () =>
  console.log(`✈️  API listening on http://localhost:${PORT}`)
);

// Shutdown gọn gàng
['SIGINT','SIGTERM'].forEach(sig =>
  process.on(sig, () => {
    console.log('\n⏹  Closing server...'); server.close(() => process.exit(0));
  })
);
