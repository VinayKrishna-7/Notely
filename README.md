# Notely

A personal markdown notes and workspace application built with React, Node.js, and MongoDB.

## Features

- Markdown editor with split live preview and debounced auto-save
- Bi-directional note linking (`[[Note Title]]`) with backlinks
- Revision history with diff inspection and one-click restore
- Tagging, favorites, pinned notes, search, and archive
- Fast omnisearch command palette (`Cmd/Ctrl + K`)
- Dark and light theme support with instant switching

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/VinayKrishna-7/Notely.git
cd Notely
npm run install:all
```

### 2. Environment Setup

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Seed Database (Optional)

Populate sample notes and the demo user:

```bash
npm run seed
```

- **Demo Email**: `demo@notely.app`
- **Demo Password**: `Password123!`

### 4. Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run client and server concurrently |
| `npm run dev:client` | Run frontend client only |
| `npm run dev:server` | Run backend API server only |
| `npm test` | Run all test suites |
| `npm run build` | Build client and server for production |

## License

MIT
