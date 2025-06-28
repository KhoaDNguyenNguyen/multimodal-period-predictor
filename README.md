# Period Predictor – Avg‑Cycle Baseline API

Fast baseline service that forecasts the next menstrual period using the rolling average of a user’s recent cycles.  Built with **Express 4** + **Neon/PostgreSQL** and ready to deploy on any Node runtime.

---

## Table of Contents

1. [Features](#features)
2. [Data model](#data-model)
3. [Quick start](#quick-start)
4. [Environment variables](#environment-variables)
5. [API reference](#api-reference)
6. [Project structure](#project-structure)
7. [Development](#development)
8. [Roadmap](#roadmap)
9. [License](#license)

---

## Features

* **Rolling‑average predictor** – computes mean cycle length from the last *N* completed cycles (default 5) to forecast the next menses start.
* **REST API** – JSON endpoints for submitting survey data and retrieving predictions.
* **PostgreSQL/Neon** – stores raw survey payloads as `jsonb` plus derived cycle events.
* **CORS ready** – allows front‑end running on `localhost:5500`.
* **12‑factor config** – secrets & ports via `.env`.
* **Container‑friendly** – tiny footprint, no native deps.

---

## Data model

```sql
CREATE TABLE IF NOT EXISTS survey_responses (
  id         SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload    JSONB       NOT NULL
);

-- derived table (optional)
CREATE TABLE IF NOT EXISTS cycles (
  user_id      TEXT,
  cycle_start  DATE,
  cycle_length INT,
  PRIMARY KEY (user_id, cycle_start)
);
```

*Only `survey_responses` is strictly required for the baseline predictor; the `cycles` table is helpful if you plan to upgrade to smarter models.*

---

## Quick start

```bash
# 1 Install deps
npm install

# 2 Configure env
cp .env.example .env  # then edit values

# 3 Run migrations (optional helper script)
npm run db:migrate

# 4 Start the API
echo "PORT=3000" >> .env
npm run dev           # nodemon
# or: node server.js
```

You should see:

```
✈️  API listening on http://localhost:3000
```

---

## Environment variables

| Key            | Example value                                    |  Required | Notes                                |
| -------------- | ------------------------------------------------ | --------- | ------------------------------------ |
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | ✅         | **Remove** `channel_binding=require` |
| `PORT`         | `3000`                                           | ❌         | Defaults to 3000                     |
| `AVG_WINDOW`   | `5`                                              | ❌         | # cycles to average                  |

Create `.env` locally; CI/CD should inject secrets at runtime.

---

## API reference

### `POST /api/survey`

Submit a daily survey payload.

```json
{
  "userId": "abc123",
  "date":   "2025-06-28",
  "flow":   2,
  "symptoms": ["cramp", "fatigue"]
}
```

**Success 200**

```json
{ "ok": true }
```

### `GET /api/predict/:userId`

Return the predicted next period start date.

```json
{
  "userId": "abc123",
  "nextPeriod": "2025-07-20",
  "avgCycleLength": 29
}
```

> **NOTE** The `/api/predict` endpoint is stubbed for the MVP; you’ll add logic in `predictor.js`.

---

## Project structure

```
├── server.js          # Express entry
├── predictor.js       # Rolling‑average logic
├── db/                # SQL migrations & helpers
├── public/            # Static front‑end (index.html, app.js)
├── .env.example       # Template
└── README.md
```

---

## Development

```bash
# auto‑restart on save
echo "NODE_ENV=development" >> .env
npm run dev

# run unit tests (jest)
npm test
```

---

## Roadmap

* [ ] `/api/predict` implementation
* [ ] JWT‑based auth & per‑user data isolation
* [ ] Optional symptom & BBT features
* [ ] Switch to Sequelize or Drizzle for migrations
* [ ] Dockerfile + CI (GitHub Actions)

---

## License

MIT © 2025 KHOA D NGUYEN NGUYEN
