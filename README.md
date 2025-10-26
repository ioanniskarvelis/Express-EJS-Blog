# Express + EJS Blog (SQLite)

Simple blog application built with Express, EJS, and SQLite. Includes author and reader flows, article publishing, comments, likes, and views.

## Features
- Author and reader authentication flows (session-based)
- Create, edit, publish, and delete articles
- Reader comments, likes, and view counters
- EJS templating and Tailwind CSS styling
- SQLite database with schema included

## Tech Stack
- Node.js, Express, EJS
- SQLite3 (file-based DB)
- Tailwind CSS
- Joi for validation

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Create and seed the database

- Windows PowerShell:

```bash
npm run build-db-win
```

- macOS/Linux:

```bash
npm run clean-db && npm run build-db
```

3) Configure environment variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

Key variables:
- `PORT` – HTTP port (default 3000)
- `SESSION_SECRET` – secret for sessions (set to a strong value)
- `DATABASE_FILE` – SQLite file path (default `./database.db`)
- `COOKIE_SECURE` – `true` to send cookies only over HTTPS in production

4) Run the app

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

5) Build CSS (optional)

```bash
# One-off build
npm run build-css

# Watch mode during development
npm run css:watch
```

## Useful Scripts
- `start` – run the server
- `dev` – run the server with hot reload
- `build-db` / `build-db-win` – build the SQLite DB from `db_schema.sql`
- `clean-db` / `clean-db-win` – remove the SQLite DB file
- `build-css` / `css:watch` – Tailwind CSS build and watch

## Project Structure

```
index.js            # App entry
routes/             # Express route modules
views/              # EJS templates
public/             # Static assets (Tailwind input/output)
db_schema.sql       # SQLite schema
```

## License

MIT. See `LICENSE` for details.

