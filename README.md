# Notely

A full-stack personal notes and knowledge management application built with React, TypeScript, Express, and MongoDB.

## Features

- **Markdown Editor**: Split-pane live preview, syntax highlighting, and debounced auto-saving.
- **Bi-directional Linking**: Link between notes using `[[Note Title]]` wiki syntax with backlink discovery.
- **Version History**: Review revisions with inline diff comparisons and one-click restore.
- **Organization**: Tags, favorites, pinned notes, archiving, and trash recovery.
- **Command Palette**: Fast keyboard navigation and omnisearch (`Ctrl+K` / `Cmd+K`).
- **Offline Support**: Progressive Web App with offline caching and background synchronization.
- **Customizable Workspace**: System/dark/light themes and customizable workspace widgets.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Mongoose, Zod
- **Database**: MongoDB

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a remote MongoDB connection string

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VinayKrishna-7/Notely.git
   cd Notely
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```
   *Demo login: `demo@notely.app` / `Password123!`*

### Development

Start both backend and frontend development servers:

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

To run them individually:
```bash
npm run dev:server
npm run dev:client
```

### Testing

```bash
# Run all tests
npm test

# Run frontend or backend tests individually
npm run test:client
npm run test:server
```

### Production Build

```bash
npm run build
```

## License

MIT
