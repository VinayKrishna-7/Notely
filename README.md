# ✦ Notely — Personal Knowledge & Notes Application

> **Notely is a full-stack personal notes and knowledge management application built with React, TypeScript, Node.js, Express, and MongoDB. It supports Markdown notes, tags, search, version history, wiki-style links, offline support, and customizable workspace features.**

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: All Rights Reserved](https://img.shields.io/badge/License-All_Rights_Reserved-red.svg)](LICENSE)

---

## ⚡ Overview

**Notely** is a full-stack personal knowledge management and productivity platform engineered to showcase modern **React frontend architecture**, performance optimization, server-state management, and polished UX. Inspired by Linear, Notion, and Apple Notes, Notely features a minimalist **Zinc & Charcoal monochrome design system**, zero layout shift, instant 0ms note switching, and resilient offline-first persistence.

---

## 🌟 Core Highlights & Features

### ⚛️ Advanced React 19 & Frontend Engineering
- **Instant Note Switching**: Leverages TanStack Query cache hydration (`initialData`) and hover prefetching to render note content with zero delay and no loading layout shifts.
- **Debounced Markdown Editor Engine**: Real-time auto-saving with debounced mutation queues, visual sync indicators, and split-pane side-by-side editing.
- **Time Machine Version History**: Non-destructive snapshot history with visual diff calculation (lines added/deleted) and 1-click restore.
- **Bi-Directional Wiki-Linking (`[[Note Title]]`)**: Real-time markdown parser detecting note references, interactive autocomplete popovers, and automatic backlink graph generation.
- **Customizable Live Clock System**: Reusable `useClock` hook with a centralized singleton ticker (“Centralized clock ticker to avoid creating separate timers for each clock component.”) and 8 customizable clock styles.
- **Physics-Based Drag-and-Drop Reordering (`@dnd-kit`)**: Smooth keyboard-accessible reordering with optimistic UI updates.
- **Global Omnisearch Command Palette (`Ctrl+K` / `Cmd+K`)**: Multi-token search parser (`tag:`, `is:pinned`, `is:favorite`, `is:archived`) with keyboard navigation and text match highlighting.
- **PWA & Offline Mutation Queue (`vite-plugin-pwa`)**: Full offline capability with background sync conflict detection and service worker caching.
- **Strict TypeScript Typing**: End-to-end type safety spanning API contracts, component props, and global state.

---

## 🎨 8 Customizable Live Clock Styles

| Style | Format Example | Ideal Placement |
|---|---|---|
| **Minimal** | `10:42 AM` | Subtle header element |
| **Date + Time** | `Fri, Sep 12` <br/> `10:42 AM` | Header / Dashboard |
| **Digital** | `10:42:37` | High-visibility monospace tracking |
| **Compact** | `10:42 AM • Fri` | Header bar |
| **Productivity** | `Friday, September 12` <br/> `10:42 AM` | Dashboard workspace banner |
| **Minimal Seconds** | `10:42:37 AM` | Precision time tracking |
| **Focus Mode** | `10:42 [FOCUS]` | Distraction-free sessions |
| **Analog Dial** | SVG timepiece dial | Visual analog rendering |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router v7
- **Server-State Management**: TanStack Query v5 (React Query)
- **Styling**: Tailwind CSS + `@tailwindcss/typography`
- **Drag and Drop**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **Markdown Processing**: `react-markdown` + `remark-gfm`
- **Icons**: `lucide-react`
- **Toasts**: `sonner`
- **Testing**: Vitest + React Testing Library + JSDOM

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose (with automated local persistence engine)
- **Validation**: Zod
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, express-rate-limit
- **Testing**: Vitest + Supertest

---

## 📁 Project Structure

```text
Notes App/
├── client/                     # React 19 Frontend
│   ├── src/
│   │   ├── api/                # Axios API service layer
│   │   ├── components/
│   │   │   ├── clock/          # Live Clock Widget, Style Selector & Settings
│   │   │   ├── common/         # Buttons, Dialogs, Logos, Sync Indicators
│   │   │   ├── editor/         # Markdown Editor, Toolbar & Autocomplete
│   │   │   ├── layout/         # Header, Sidebar, Command Palette, Mobile Nav
│   │   │   ├── notes/          # Note Cards, Grid, Filter Bar & Backlinks
│   │   │   ├── tags/           # Tag Badges & Manager Modal
│   │   │   ├── ui/             # Radix-inspired accessible primitive components
│   │   │   └── versions/       # Version History & Snapshot Diff Viewer
│   │   ├── contexts/           # Auth, Theme, and Sidebar Context Providers
│   │   ├── hooks/              # Custom React Hooks (useClock, useNotes, useAutoSave, etc.)
│   │   ├── pages/              # Lazy-loaded page views
│   │   ├── types/              # Centralized TypeScript declarations
│   │   └── utils/              # Formatters, highlight, offlineQueue, cn
│   └── package.json
│
├── server/                     # Express.js REST API Backend
│   ├── src/
│   │   ├── config/             # DB & Environment Configuration
│   │   ├── controllers/        # Auth, Notes, Tags, Stats, Versions, Backlinks
│   │   ├── middleware/         # JWT Auth, Validation & Error Handlers
│   │   ├── models/             # Mongoose Schemas (User, Note, Tag, NoteVersion)
│   │   ├── routes/             # Express API Routes
│   │   ├── validators/         # Zod Request Validation Schemas
│   │   └── server.ts           # Server Entry Point
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm** or **pnpm** / **yarn**

---

### 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/VinayKrishna-7/Notely.git
   cd Notely
   ```

2. **Install all dependencies** (root, client, and server):
   ```bash
   npm run install:all
   ```
   *(or individually: `npm --prefix server install` and `npm --prefix client install`)*

---

### 💻 Development

Run both the frontend and backend concurrently with a single command:

```bash
npm run dev
```

- **Client App**: [http://localhost:5173](http://localhost:5173)
- **Server API**: [http://localhost:5000](http://localhost:5000)

---

### 🧪 Running Tests

#### Run Frontend Tests (Vitest + React Testing Library)
```bash
npm --prefix client test
```

#### Run Backend Integration Tests (Vitest + Supertest)
```bash
npm --prefix server test
```

---

### 🏗️ Production Build

To verify and produce optimized production bundles:

```bash
npm --prefix client run build
npm --prefix server run build
```

---

## 🔒 Security & Quality Standards
- Strict password hashing with **bcryptjs** (10 salt rounds).
- Token-based stateless authentication using **JSON Web Tokens (JWT)**.
- Input scrubbing and strict type validation with **Zod**.
- Protection against common vulnerabilities with **Helmet** HTTP headers and **CORS**.
- Comprehensive unit and integration test coverage across all core modules.

---


