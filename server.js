
import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import { neon } from '@neondatabase/serverless';


dotenv.config();
if (!process.env.DATABASE_URL)
  throw new Error('Missing DATABASE_URL');

const sql = neon(process.env.DATABASE_URL);


const app = express();
app.use(express.json({ limit: '1mb' }));

const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  process.env.FRONTEND_URL       
].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));


import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));       
app.get('/', (_,res)=>res.sendFile(path.join(__dirname,'index.html')));


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



const PORT   = process.env.PORT ?? 3000;
const server = app.listen(PORT, () =>
  console.log(`✈️  API listening on http://localhost:${PORT}`)
);

['SIGINT','SIGTERM'].forEach(sig =>
  process.on(sig, () => {
    console.log('\n⏹  Closing server...'); server.close(() => process.exit(0));
  })
);
