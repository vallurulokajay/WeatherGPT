# WeatherGPT Frontend

A polished, modern AI chat interface for weather queries. Built with React, TypeScript, and Tailwind CSS.

> 📖 **Full Developer & Backend Integration Guide**: See [../README.md](../README.md) for exhaustive cross-platform setup instructions (Windows, macOS, Linux), backend handoff specifications, CORS setup, and troubleshooting.

## Features

- 🌤️ AI-powered weather conversation interface
- 🌙 Premium dark theme design
- 💬 Multi-turn conversation support
- 📱 Fully responsive (desktop, tablet, mobile)
- ✨ Smooth animations and transitions
- 📂 Collapsible sidebar with conversation history
- ⚡ Typewriter-style response animation
- 🔄 Loading/thinking indicators
- ❌ Graceful error handling with timeout protection

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

## Installation

```bash
# Ensure you are inside the frontend directory
cd frontend

# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file inside `frontend/` (or copy from `.env.example`):

```bash
cp .env.example .env
```

| Variable             | Default                  | Description                |
| -------------------- | ------------------------ | -------------------------- |
| `VITE_API_BASE_URL`  | `http://localhost:3001`  | Backend API server URL     |

## Running the Development Server

```bash
npm run dev
```

The app will start at [http://localhost:5173](http://localhost:5173).

## Building for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

## Backend API Contract

The frontend expects a backend server that exposes:

### `POST /api/chat`

**Request body:**

```json
{
  "message": "What is the weather in Hyderabad tomorrow?",
  "conversationId": "optional-conversation-id",
  "location": {
    "latitude": 17.4933,
    "longitude": 78.3917
  }
}
```

> **Note on `location`**: The `location` field is optional. When browser location access is permitted, the frontend automatically includes `{ latitude, longitude }` in all `/api/chat` requests. If permission is denied or unavailable, `location` is sent as `null` (e.g. `"location": null`), and the backend should handle queries without location data gracefully.

**Response body:**

```json
{
  "response": "Tomorrow in Hyderabad will be partly cloudy with a temperature around 29°C.",
  "conversationId": "conversation-id"
}
```

### Error handling

The frontend handles:

- **Network errors** — server unreachable
- **HTTP errors** — non-2xx status codes
- **Timeout** — requests that take longer than 30 seconds
- **Malformed responses** — missing or invalid `response` field

All errors are displayed as user-friendly messages in the chat interface.

## Connecting to a Backend

1. Start your backend server (e.g., on `http://localhost:3001`).
2. Set `VITE_API_BASE_URL` in your `.env` file to the backend URL.
3. Run `npm run dev` — the frontend will proxy requests to your backend.

If no backend is available, the frontend will display an error message when you attempt to send a query.

## Project Structure

```
src/
├── api/
│   └── chatApi.ts          # API service layer
├── components/
│   ├── App.tsx              # Root component
│   ├── Chat/
│   │   ├── AssistantMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── UserMessage.tsx
│   ├── Landing/
│   │   └── LandingView.tsx
│   └── Sidebar/
│       ├── ConversationList.tsx
│       ├── NewChatButton.tsx
│       └── Sidebar.tsx
├── context/
│   └── ChatContext.tsx      # State management
├── hooks/
│   ├── useAutoScroll.ts
│   └── useTypewriter.ts
├── types/
│   └── index.ts             # TypeScript interfaces
├── index.css                # Global styles + Tailwind
└── main.tsx                 # Entry point
```

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS 3** — Utility-first styling
