# WeatherGPT — Developer Setup & Integration Guide

Welcome to **WeatherGPT**, a polished, modern AI chat application for conversational weather forecasting.

This guide is designed as an exhaustive developer handoff. Whether you are setting up the frontend on Windows, macOS, or Linux, or you are a backend developer implementing the API server, this document covers everything you need to run, test, and integrate the application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Exact Project Structure](#2-exact-project-structure)
3. [Prerequisites & System Requirements](#3-prerequisites--system-requirements)
4. [Windows Setup Guide](#4-windows-setup-guide)
5. [macOS Setup Guide (Beginner-Friendly)](#5-macos-setup-guide-beginner-friendly)
6. [Linux Setup Guide](#6-linux-setup-guide)
7. [Dependency Installation & node_modules](#7-dependency-installation--node_modules)
8. [Environment Variables & Security](#8-environment-variables--security)
9. [Running the Frontend (Dev & Production)](#9-running-the-frontend-dev--production)
10. [Frontend-to-Backend Architecture & API Contract](#10-frontend-to-backend-architecture--api-contract)
11. [Browser Geolocation Functionality](#11-browser-geolocation-functionality)
12. [Connecting to a Backend on the Same Computer](#12-connecting-to-a-backend-on-the-same-computer)
13. [Connecting to a Backend on Another Computer (Team Setup)](#13-connecting-to-a-backend-on-another-computer-team-setup)
14. [CORS (Cross-Origin Resource Sharing)](#14-cors-cross-origin-resource-sharing)
15. [End-to-End Communication Walkthrough](#15-end-to-end-communication-walkthrough)
16. [Testing the Connection & Network Inspection](#16-testing-the-connection--network-inspection)
17. [Comprehensive Troubleshooting Guide](#17-comprehensive-troubleshooting-guide)
18. [Production & Deployment Considerations](#18-production--deployment-considerations)
19. [Backend Developer Handoff Specification](#19-backend-developer-handoff-specification)
20. [Frontend Developer Onboarding Checklist](#20-frontend-developer-onboarding-checklist)

---

## 1. Project Overview

### What is WeatherGPT?
WeatherGPT is a conversational AI weather assistant featuring a minimalist dark theme interface. Instead of requiring users to decipher complex meteorological dashboards, it enables natural multi-turn conversations about current weather conditions, upcoming forecasts, storm alerts, clothing recommendations, and outdoor planning.

### What Does the Frontend Do?
The frontend provides the complete client experience in the browser:
- **Landing Experience**: Centered WeatherGPT branding with a quick-start input box.
- **Conversation Interface**: Transitions smoothly from the landing view into a multi-turn chat stream.
- **Collapsible Sidebar**: Allows managing and reviewing conversation sessions, starting fresh chats, or switching contexts.
- **Polished Animations**: Features character-by-character typewriter text reveals, pulsing loading/thinking indicators, and automatic scroll tracking.
- **Automatic Geolocation**: Seamlessly requests and caches browser coordinates (`latitude`, `longitude`) so the AI can provide location-accurate weather without badgering the user to type their city name every time.
- **Resilient Networking**: Enforces 30-second request timeouts, detects network drops, and renders clear, friendly inline error messages.

### How Do the Frontend and Backend Interact?
The frontend and backend follow a decoupled client-server architecture communicating over standard HTTP:
1. The user inputs a query into the frontend UI.
2. The frontend packages the prompt, active `conversationId`, and user coordinates (`location`) into a JSON payload.
3. The frontend sends an HTTP `POST` request to the backend endpoint: `/api/chat`.
4. The backend receives the request, parses the location, retrieves live weather data (e.g., via OpenWeatherMap, Tomorrow.io, or NOAA), prompts an AI model (e.g., Gemini or GPT), and formats a concise response.
5. The backend returns a JSON payload containing the assistant's reply and the conversation ID.
6. The frontend renders the response into the active conversation thread with a typewriter animation.

### Current Technology Stack
- **UI Framework**: [React 18](https://react.dev/) (`react@^18.3.1`, `react-dom@^18.3.1`)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (`typescript@^5.6.3`)
- **Build Tool & Dev Server**: [Vite 6](https://vitejs.dev/) (`vite@^6.0.3`, `@vitejs/plugin-react@^4.3.4`)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) (`tailwindcss@^3.4.16`), [PostCSS 8](https://postcss.org/), [Autoprefixer 10](https://github.com/postcss/autoprefixer)
- **Runtime**: Node.js (v18.0.0+)

### Frontend vs. Backend Responsibility Boundary
> [!IMPORTANT]
> **Repository Scope**: This repository currently contains the **frontend application code and configuration** located in the `frontend/` directory.
> The backend server is maintained separately and can be implemented in any language or framework (such as Python FastAPI, Node.js Express, Flask, Go, etc.) as long as it adheres to the [Backend API Contract](#10-frontend-to-backend-architecture--api-contract).

| Layer | Responsibility | Location |
| :--- | :--- | :--- |
| **Frontend (This Repo)** | User interface, state management, Geolocation coordinate acquisition, chat rendering, input validation, network error handling. | `WeatherGPT/frontend/` |
| **Backend (Separate Service)** | Weather API calls, API key storage, AI/LLM orchestration, prompt engineering, conversation database persistence. | Maintained independently by backend developer |

---

## 2. Exact Project Structure

All frontend application code, static assets, and frontend build configurations strictly reside inside the `frontend/` folder. The root directory contains project-wide documentation and specifications.

```
WeatherGPT/
├── AGENTS.md                  # System instructions & agent guidelines
├── README.md                  # Master developer setup and integration guide (this file)
└── frontend/                  # All frontend code & configuration MUST remain inside here
    ├── .env.example           # Template for local frontend environment variables
    ├── .gitignore             # Git ignore file (ignores node_modules, dist, .env)
    ├── index.html             # Single-page application HTML entry point
    ├── package.json           # Frontend dependencies, project metadata, and npm scripts
    ├── package-lock.json      # Locked dependency tree ensuring identical installs across machines
    ├── postcss.config.js      # PostCSS pipeline plugins (Tailwind CSS and Autoprefixer)
    ├── tailwind.config.js     # Tailwind design system configuration (colors, dark theme, animations)
    ├── tsconfig.json          # TypeScript compiler configuration (ES2020 target, strict checks)
    ├── vite.config.ts         # Vite bundler, dev server settings (port 5173), and React plugin
    ├── dist/                  # Static production build output (generated after running `npm run build`)
    ├── node_modules/          # Locally installed packages (generated after `npm install`, never committed)
    └── src/                   # Application TypeScript & React source code
        ├── main.tsx           # React DOM root render mount point
        ├── index.css          # Global CSS stylesheet & Tailwind utility directives
        ├── vite-env.d.ts      # TypeScript declaration file for Vite environment variables
        ├── api/
        │   └── chatApi.ts     # HTTP client for POST /api/chat with timeout and error classification
        ├── components/
        │   ├── App.tsx        # Main application layout, sidebar toggle, and view state router
        │   ├── Chat/
        │   │   ├── AssistantMessage.tsx # Assistant chat bubble with live typewriter text reveal
        │   │   ├── ChatInput.tsx        # Auto-resizing textarea with submit and keyboard shortcuts
        │   │   ├── ChatWindow.tsx       # Main message stream container with scroll tracking
        │   │   ├── MessageList.tsx      # Renders chronological sequence of conversation messages
        │   │   ├── TypingIndicator.tsx  # Pulsing animated thinking state during API requests
        │   │   └── UserMessage.tsx      # User message bubble styled for dark mode
        │   ├── Landing/
        │   │   └── LandingView.tsx      # Hero landing screen with centered logo & prompt box
        │   └── Sidebar/
        │       ├── ConversationList.tsx # Chronological list of saved sessions with delete support
        │       ├── NewChatButton.tsx    # "+ New Chat" button to reset the current session
        │       └── Sidebar.tsx          # Responsive collapsible drawer for desktop and mobile
        ├── context/
        │   └── ChatContext.tsx# Reducer-based state management (messages, sessions, loading, location)
        ├── hooks/
        │   ├── useAutoScroll.ts # Automatically keeps viewport pinned to the latest message
        │   └── useTypewriter.ts # Character-by-character smooth animation hook
        ├── services/
        │   └── locationService.ts # Geolocation API wrapper with coordinate caching and permission listeners
        └── types/
            └── index.ts       # Shared TypeScript definitions (Message, Conversation, Location, API payloads)
```

> [!WARNING]
> **Organizational Rule**: Never place frontend source files or frontend configuration in the repository root. All frontend dependencies, configuration files (`vite.config.ts`, `package.json`, `tsconfig.json`, `.env`), and source files (`src/`) must stay inside `WeatherGPT/frontend/`.

---

## 3. Prerequisites & System Requirements

Before running the project on any computer, install the following required software:

| Requirement | Supported Versions | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | `v20.x LTS` or `v22.x LTS` | JavaScript runtime to build and run Vite |
| **npm** | `>= 9.0.0` | Bundled with Node.js (`v10.x` or `v11.x`) | Package manager to install project dependencies |
| **Web Browser** | Any modern browser | Google Chrome, Safari, Firefox, Edge | Supports ES2020 JavaScript and Geolocation API |

### Verifying Software on Your Machine
Open your terminal (PowerShell on Windows, Terminal on macOS/Linux) and verify your installations:

```bash
# Check Node.js version (must be v18.0.0 or higher)
node --version

# Check npm version (must be v9.0.0 or higher)
npm --version
```

- If `node --version` prints `v20.18.0` (or another version `18+`), Node.js is ready.
- If the command returns an error such as `command not found` or is not recognized, install Node.js using the operating system instructions below.

---

## 4. Windows Setup Guide

Follow these exact steps to run the frontend on a Windows PC.

### Step 1: Open Terminal / PowerShell
1. Press the **Windows Key** on your keyboard.
2. Type `PowerShell` or `Windows Terminal`.
3. Click to open **Windows PowerShell**.

### Step 2: Navigate to the Project Root
Change directory into your WeatherGPT project folder:
```powershell
# Example path (adjust to where your folder is located):
cd D:\Projects\WeatherGPT
```

### Step 3: Enter the Frontend Directory
```powershell
cd frontend
```
Verify that you see `package.json` by running:
```powershell
Get-ChildItem
```

### Step 4: Install Dependencies
```powershell
npm install
```
*(If PowerShell displays an error about script execution policies like `npm.ps1 cannot be loaded`, run `npm.cmd install` instead).*

### Step 5: Configure Environment Variables
Create your local `.env` file by copying the example template:
```powershell
Copy-Item .env.example .env
```
By default, `.env` contains:
```env
VITE_API_BASE_URL=http://localhost:3001
```
*(If your backend runs on another port, such as `http://localhost:8000`, open `.env` in Notepad or your editor and change the port number).*

### Step 6: Start the Development Server
```powershell
npm run dev
```
*(Or `npm.cmd run dev` if PowerShell blocks `.ps1` scripts).*

Vite will start the server and output:
```
  VITE v6.4.3  ready in 280 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 7: Open the Application
Open your web browser (Google Chrome, Microsoft Edge, etc.) and visit:
👉 **`http://localhost:5173`**

### Step 8: Stopping the Server
To stop the development server, return to your PowerShell window and press **`Ctrl + C`**, then press `Y` if prompted.

---

## 5. macOS Setup Guide (Beginner-Friendly)

This section is written step-by-step for macOS users, including developers who may not use the Mac Terminal frequently.

### Step 1: Open the Mac Terminal
1. Press **`Command (⌘) + Spacebar`** to open Spotlight Search.
2. Type `Terminal`.
3. Press **`Return (Enter)`**. A black or white command-line window will appear.

### Step 2: Check if Node.js is Installed
In the Terminal window, type:
```bash
node -v
```
and press **Return**.

- **If you see `v18.x.x`, `v20.x.x`, or `v22.x.x`**: Node.js is already installed! Proceed directly to **Step 4**.
- **If you see `zsh: command not found: node`**: Node.js is not yet installed on your Mac. Follow Step 3 below.

### Step 3: Install Node.js on macOS (If Not Installed)

#### Method A: Official Installer (Simplest for Beginners)
1. Open Safari or Chrome and visit: **[https://nodejs.org/](https://nodejs.org/)**
2. Click the green button that says **LTS (Recommended For Most Users)** to download the `.pkg` file.
3. Open the downloaded `.pkg` file from your Downloads folder and click **Continue** through the installer wizard.
4. Once finished, **quit Terminal completely** (press `Command + Q`) and reopen Terminal so it recognizes the newly installed software.

#### Method B: Homebrew (For Developers Using Brew)
If you already have Homebrew installed:
```bash
brew install node
```

### Step 4: Verify Node and npm
In your newly opened Terminal window, confirm both commands work:
```bash
node -v
npm -v
```
You should see version numbers for both (e.g. `v20.12.0` and `10.5.0`).

### Step 5: Navigate to the WeatherGPT Directory
In the Terminal, use `cd` (which stands for *Change Directory*) to navigate to where the project is saved on your Mac.

For example, if you downloaded or placed `WeatherGPT` in your `Downloads` folder:
```bash
cd ~/Downloads/WeatherGPT
```
Or if it is in your `Documents` folder:
```bash
cd ~/Documents/WeatherGPT
```
You can type `pwd` (*Print Working Directory*) and press Return to confirm your current folder location.

### Step 6: Enter the Frontend Directory
```bash
cd frontend
```
Confirm you are in the right place by listing files with `ls`:
```bash
ls -la
```
You should see `package.json`, `vite.config.ts`, `src/`, etc.

### Step 7: Install Dependencies
Run the command below to download the required packages:
```bash
npm install
```
This process takes about 10–30 seconds. When finished, a `node_modules/` folder will be created locally on your Mac.

### Step 8: Configure the Environment File
Copy the example environment file to `.env`:
```bash
cp .env.example .env
```
*(If your backend runs on a different port like `8000`, you can edit `.env` using TextEdit or by running `nano .env` in Terminal).*

### Step 9: Start the Development Server
Start the frontend with:
```bash
npm run dev
```
You will see output similar to:
```
  VITE v6.4.3  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 10: View the Application
Open **Safari** or **Google Chrome** and enter:
👉 **`http://localhost:5173`**

You will see the dark-themed WeatherGPT landing page.

### Step 11: Stopping the Server
To stop the server at any time, return to your Mac Terminal window and press **`Control + C`** on your keyboard.

---

### Common macOS Issues & Plain-English Fixes

| Issue on Mac | What It Means | How to Fix |
| :--- | :--- | :--- |
| `zsh: command not found: node` | Your Mac does not know where Node.js is. | Install Node.js from [nodejs.org](https://nodejs.org/), then quit and reopen Terminal. |
| `npm ERR! code ENOENT: package.json` | You ran `npm install` or `npm run dev` from the wrong folder. | You are probably in the `WeatherGPT` root folder instead of `WeatherGPT/frontend`. Run `cd frontend` first. |
| `EACCES: permission denied` | Terminal lacks permission to write to a system folder. | **Do NOT use `sudo npm install`**. Ensure the project folder is inside your user directory (such as `~/Documents` or `~/Downloads`) where your user account has write permissions. |
| `Port 5173 is already in use` | Another program or a previous Vite instance is still running. | In Terminal, run `lsof -i :5173` to find the process ID (PID), then run `kill -9 <PID>` to close it. Or let Vite pick the next port (e.g. `5174`). |
| Safari Location Alert | Safari asks: *"Would you like to allow 'localhost' to use your current location?"* | Click **Allow**. If you clicked "Don't Allow" by accident, reset it in Safari: **Settings → Websites → Location → set localhost to Allow**. |

---

## 6. Linux Setup Guide

For developers running Ubuntu, Debian, Fedora, Arch Linux, or WSL (Windows Subsystem for Linux):

### 1. Install Node.js (If Not Present)
On Ubuntu/Debian:
```bash
# Install Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```
Verify:
```bash
node -v
npm -v
```

### 2. Clone/Enter the Repository
```bash
cd ~/WeatherGPT/frontend
```

### 3. Install Packages & Set Environment
```bash
npm install
cp .env.example .env
```

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 7. Dependency Installation & `node_modules`

### Why Must You Run `npm install`?
When you clone or download a JavaScript/TypeScript project, the code relies on third-party libraries (like React, Vite, and Tailwind CSS). These libraries are declared as dependencies inside `package.json` and locked to exact versions in `package-lock.json`. 

Running `npm install` downloads and prepares all dependencies so the code can compile and run.

### Where Must It Be Run?
> [!IMPORTANT]
> **Always run `npm install` inside `WeatherGPT/frontend/`**, where `package.json` resides. Running `npm install` in the project root will fail because there is no root-level `package.json`.

```bash
# Correct workflow:
cd WeatherGPT/frontend
npm install
```

### What is `node_modules`?
`node_modules` is a directory containing the installed package code, TypeScript type definitions, and pre-compiled native binaries (such as the `esbuild` binary used by Vite). It often contains tens of thousands of files and takes over 100 MB of disk space.

### Why Must `node_modules` NEVER Be Transferred Between Computers?
1. **Operating System Incompatibility**: Many build tools compile native platform-specific binaries during installation. For example, Vite relies on `esbuild`. If you install packages on Windows, you get `esbuild.exe`. If you copy that folder to macOS, the Mac will crash with an invalid executable error because it needs `esbuild-darwin-arm64` or `esbuild-darwin-x64`.
2. **File Transfer Bloat**: Copying, zipping, or emailing 20,000+ tiny files takes significantly longer than letting `npm install` download them natively.
3. **Best Practice**: Always transfer the project folder **without `node_modules`**. Once the folder arrives on a new computer, open terminal in `frontend/` and run `npm install`.

---

## 8. Environment Variables & Security

The frontend uses Vite's built-in environment variable management (`import.meta.env`).

### The `.env` Configuration File
Inside `WeatherGPT/frontend/`, create a file named `.env` (or copy from `.env.example`).

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:3001
```

### Supported Environment Variables

| Variable Name | Required | Default If Omitted | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Optional | `http://localhost:3001` | The root HTTP URL of the backend API server. |

### Concrete Local Development Examples

- **If your backend is Express on port 3001**:
  ```env
  VITE_API_BASE_URL=http://localhost:3001
  ```
- **If your backend is Python FastAPI / Uvicorn on port 8000**:
  ```env
  VITE_API_BASE_URL=http://localhost:8000
  ```
- **If your backend is Flask on port 5000**:
  ```env
  VITE_API_BASE_URL=http://localhost:5000
  ```
- **If your backend is running on a teammate's computer on your Wi-Fi**:
  ```env
  VITE_API_BASE_URL=http://192.168.1.45:8000
  ```

### Understanding `localhost` and Ports

- **What is `localhost`?** `localhost` is a special domain name that loops back to the exact computer you are currently sitting in front of (IP `127.0.0.1`).
- **Frontend Port (`5173`)**: By default, Vite runs the web browser frontend at `http://localhost:5173`.
- **Backend Port (e.g. `8000` or `3001`)**: The backend server is a completely separate process listening on a different port.
- **Why are they different?** Two different applications cannot listen to the same port on the same machine simultaneously. The frontend lives on port `5173` and makes HTTP requests to the backend on port `8000`.

### 🚨 Critical Security Rule: Frontend Variables are 100% Public

> [!CAUTION]
> **NEVER put secret keys, database passwords, or private API keys in `frontend/.env`!**
>
> In Vite, all environment variables prefixed with `VITE_` are bundled directly into the client-side JavaScript files.
> Anyone who visits your website can open browser DevTools, view the JavaScript source code, and read every single `VITE_*` variable.
>
> - **DO**: Put the backend server URL (`VITE_API_BASE_URL`) in `frontend/.env`.
> - **DO NOT**: Put OpenAI keys, Gemini keys, Weather API keys, or JWT secrets in `frontend/.env`.
> - **WHERE SECRETS BELONG**: All API keys and secrets must reside strictly in the **backend server's private environment variables**, never in the frontend.

---

## 9. Running the Frontend (Dev & Production)

All npm scripts must be run from inside `WeatherGPT/frontend/`.

### Development Server
```bash
cd WeatherGPT/frontend
npm run dev
```
- **What it does**: Starts the local Vite development server with Hot Module Replacement (HMR). Any edits you make to React components or CSS are instantly reflected in the browser without reloading the page.
- **Local URL**: `http://localhost:5173/` (accessible from this computer's browser).
- **Network URL**: If started with `npm run dev -- --host`, Vite outputs a LAN URL (e.g. `http://192.168.1.35:5173/`) which allows testing from a smartphone or tablet connected to the same Wi-Fi network.
- **How to stop**: Press `Ctrl + C` (Windows/Linux) or `Control + C` (macOS) in the terminal.

### Production Build
To create a fully optimized, minified production build:
```bash
npm run build
```
- **What it does**: Executes `tsc` (TypeScript compiler) to verify type integrity, then runs `vite build` to bundle, minify, and tree-shake all JavaScript, CSS, and HTML into the `frontend/dist/` folder.
- **Output**: Pure static files ready to be deployed to any web server or CDN (Vercel, Netlify, Cloudflare Pages, AWS S3, Nginx).

### Local Preview of Production Build
To test how the production bundle behaves before deploying:
```bash
npm run preview
```
- **What it does**: Spins up a lightweight local web server serving the compiled files from `dist/` (usually on `http://localhost:4173`).

---

## 10. Frontend-to-Backend Architecture & API Contract

### Communication Flow

```
┌────────────────────────────────────────────────────────┐
│                   User in Web Browser                  │
└───────────────────────────┬────────────────────────────┘
                            │ (Types weather question)
                            ▼
┌────────────────────────────────────────────────────────┐
│              WeatherGPT React Frontend                 │
│                 (http://localhost:5173)                │
│                                                        │
│  - Captures message                                    │
│  - Queries Geolocation API (latitude & longitude)      │
│  - Generates or tracks conversationId                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTP POST ${VITE_API_BASE_URL}/api/chat
                            │ Content-Type: application/json
                            │ Body: { message, conversationId, location }
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Backend API Server                   │
│         (e.g., FastAPI / Express on :8000 / :3001)     │
│                                                        │
│  1. Receives coordinates or city intent                │
│  2. Calls Weather API (OpenWeather, Tomorrow.io, etc.) │
│  3. Formulates response with AI / LLM                  │
│  4. Preserves multi-turn conversation context          │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTP 200 OK
                            │ Content-Type: application/json
                            │ Body: { response, conversationId }
                            ▼
┌────────────────────────────────────────────────────────┐
│              WeatherGPT React Frontend                 │
│                                                        │
│  - Parses JSON response                                │
│  - Animates reply with typewriter character reveal     │
│  - Updates conversation history in sidebar             │
└────────────────────────────────────────────────────────┘
```

---

### The Backend API Contract

The frontend code (`src/api/chatApi.ts`) defines an exact specification that the backend server must satisfy.

#### Endpoint
`POST /api/chat`  
*(Full URL: `${VITE_API_BASE_URL}/api/chat`)*

#### Request Headers
```http
Content-Type: application/json
```

#### Request Payload Structure

```typescript
export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface ChatApiRequest {
  message: string;
  conversationId?: string;
  location?: UserLocation | null;
}
```

#### Case A: When User Allows Location Access
```json
{
  "message": "What is the forecast for this afternoon?",
  "conversationId": "b10c8c31-9727-46bc-926f-d16e043a5ee9",
  "location": {
    "latitude": 17.4933,
    "longitude": 78.3917
  }
}
```

#### Case B: When Location Permission is Denied or Unavailable
```json
{
  "message": "What is the weather in London tomorrow?",
  "conversationId": "b10c8c31-9727-46bc-926f-d16e043a5ee9",
  "location": null
}
```

#### Request Field Specifications

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | `string` | **Yes** | The plain text prompt entered by the user. Trimmed of leading/trailing whitespace. |
| `conversationId` | `string` | No (Recommended) | A unique UUID representing the active chat session. Enables the backend to maintain context across multi-turn exchanges. Generated by frontend on first query. |
| `location` | `object` or `null` | No | An object containing coordinates, or `null` if location permission was not granted or timed out. |
| `location.latitude` | `number` | Required if `location` present | User's latitude as a float rounded to 4 decimal places (e.g. `17.4933`). |
| `location.longitude` | `number` | Required if `location` present | User's longitude as a float rounded to 4 decimal places (e.g. `78.3917`). |

---

#### Expected Successful Response (`200 OK`)

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body
```json
{
  "response": "This afternoon in Hyderabad will be mostly sunny with temperatures peaking around 32°C and light easterly winds.",
  "conversationId": "b10c8c31-9727-46bc-926f-d16e043a5ee9"
}
```

#### Response Field Specifications

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `response` | `string` | **Yes** | The AI assistant's text answer to be rendered in the chat bubble. Must be a non-empty string. |
| `conversationId` | `string` | **Yes** | The conversation ID associated with this session. |

---

### Error Handling & Timeout Behavior

The frontend handles network failures and server issues gracefully:

1. **Strict 30-Second Timeout**: The frontend uses `AbortController` to abort any request that takes longer than 30,000 ms. If aborted, it displays:  
   *`"Request timed out. The server took too long to respond."`*
2. **HTTP Error Status Codes**: If the backend returns a non-2xx status (e.g. 404, 500, 502), the frontend displays:  
   *`"Server returned <status>: <statusText>"`*
3. **Network Failure / Refusal**: If the backend is not running or blocked by CORS, `fetch` throws a `TypeError`. The frontend displays:  
   *`"Unable to connect to WeatherGPT server. Please check your connection."`*
4. **Malformed Payload**: If the backend returns invalid JSON or lacks the `response` string field, the frontend displays:  
   *`"Received malformed response from server."`*

---

## 11. Browser Geolocation Functionality

WeatherGPT integrates with the browser's standard **Geolocation API** (`navigator.geolocation`) managed in `src/services/locationService.ts`.

### How It Works

1. **Trigger on First Query**: When the user sends their first query (e.g., *"How is the weather today?"*), the frontend checks whether coordinates are already in memory.
2. **Graceful Browser Prompt**: If not yet determined, the browser shows its native permission popup:
   - *"localhost:5173 wants to know your location"*
3. **Safe 4-Second Timeout**: If the user ignores the permission banner or delays clicking it, the frontend's internal timer settles after 4,000 ms, sets `location: null`, and sends the chat message anyway. **The chat flow is never blocked or frozen by permission dialogs.**
4. **When Permission is Granted**:
   - The browser retrieves coordinates via `navigator.geolocation.getCurrentPosition`.
   - The coordinates are rounded to 4 decimal places (precision of ~11 meters, optimal for weather modeling without transmitting excess precision).
   - Coordinates are cached in application state (`ChatState.location`) and `LocationService.cachedLocation`.
   - The coordinates are included as `{ latitude, longitude }` in the `/api/chat` payload.
5. **Subsequent Messages in Session**: All subsequent queries automatically reuse the cached coordinates from memory. The browser will **not** re-prompt the user again during the session.
6. **When Permission is Denied**:
   - If the user clicks "Block" or "Don't Allow", the status transitions to `'denied'`.
   - `location: null` is transmitted with the request.
   - The user can still ask about any city manually (e.g. *"What is the weather in Paris?"*), and the backend should extract the city name from the prompt.
7. **Privacy & UI**: Exact latitude and longitude coordinates are never rendered into user chat bubbles to maintain a clean aesthetic and preserve privacy. Coordinates are transmitted silently in the API payload.

---

## 12. Connecting to a Backend on the Same Computer

If you are developing both the frontend and backend on the same computer:

```
[Browser Frontend: http://localhost:5173] ────HTTP────► [Local Backend: http://localhost:8000]
```

### Setup Steps

1. Start your backend server on its local port (for example, port `8000`).
2. Open `WeatherGPT/frontend/.env` in your text editor.
3. Update `VITE_API_BASE_URL` to match your backend port:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
4. If your Vite development server is already running, stop it with `Ctrl + C` and restart it (`npm run dev`) so it reads the new `.env` setting.
5. Open `http://localhost:5173` in your browser.
6. Submit a message. The request will travel from `localhost:5173` to `localhost:8000/api/chat`.

> [!NOTE]
> The backend server must be started and listening before sending queries, otherwise the frontend will display `"Unable to connect to WeatherGPT server"`.

---

## 13. Connecting to a Backend on Another Computer (Team Setup)

A very common scenario: **Developer A** is running the frontend on a Mac or Windows PC, and **Developer B** (your teammate/friend) is running the backend server on their own computer connected to the same Wi-Fi network.

```
┌────────────────────────────────────────┐       Local Wi-Fi Network       ┌────────────────────────────────────────┐
│         Developer A (Frontend)         │  (e.g., 192.168.1.0/24 subnet)   │          Developer B (Backend)         │
│          Mac / Windows Laptop          │                                 │          Laptop / Desktop              │
│       IP: 192.168.1.35                 │                                 │       IP: 192.168.1.50                 │
│                                        │                                 │                                        │
│  Runs Vite on http://localhost:5173    │ ─── HTTP POST /api/chat ──────► │  Runs Backend on port 8000             │
│  .env:                                 │                                 │  Listens on: 0.0.0.0:8000              │
│  VITE_API_BASE_URL=                    │ ◄── JSON Response { response }  │  CORS allows:                          │
│     http://192.168.1.50:8000           │                                 │     http://localhost:5173              │
└────────────────────────────────────────┘                                 └────────────────────────────────────────┘
```

### Why `localhost` Does Not Work Between Two Computers
`localhost` means *"this physical machine"*. If Developer A sets `VITE_API_BASE_URL=http://localhost:8000`, Developer A's browser will look for a backend running on Developer A's own laptop, not Developer B's machine!

### Step 1: Find the Backend Machine's Local IP Address
Developer B must find their computer's local network IP address:

- **On Windows**:
  Open Command Prompt or PowerShell and run:
  ```cmd
  ipconfig
  ```
  Look for **IPv4 Address** under your active Wi-Fi adapter (e.g. `192.168.1.50`).
- **On macOS**:
  Open Terminal and run:
  ```bash
  ipconfig getifaddr en0
  ```
  *(Or check **System Settings → Wi-Fi → Details → IP Address**)*.
- **On Linux**:
  Run:
  ```bash
  hostname -I
  ```

### Step 2: Ensure the Backend Binds to `0.0.0.0`
By default, many development servers (like Flask or Uvicorn) only listen on `127.0.0.1` (localhost), which rejects connections coming from other computers.
Developer B must configure their server to bind to host `0.0.0.0` (all network interfaces):
- **FastAPI / Uvicorn**: `uvicorn main:app --host 0.0.0.0 --port 8000`
- **Flask**: `app.run(host="0.0.0.0", port=8000)`
- **Express**: `app.listen(8000, "0.0.0.0", ...)`

### Step 3: Configure Firewall on Backend Machine
Developer B's operating system firewall must permit inbound TCP traffic on port `8000`:
- **Windows**: Windows Defender Firewall may display a popup: *"Allow Python/Node to communicate on private networks"*. Click **Allow**.
- **macOS**: System Settings → Network → Firewall → Options → Ensure the backend application allows incoming connections.

### Step 4: Configure the Frontend `.env`
On Developer A's computer, open `WeatherGPT/frontend/.env` and enter Developer B's IP and port:
```env
VITE_API_BASE_URL=http://192.168.1.50:8000
```
Restart the Vite dev server (`Ctrl + C`, then `npm run dev`).

---

## 14. CORS (Cross-Origin Resource Sharing)

### What is CORS?
CORS is a security mechanism enforced by web browsers. When JavaScript running on `http://localhost:5173` tries to fetch data from `http://localhost:8000` (a different port), the browser treats them as **different origins**.

Before allowing the response through, the browser checks whether the backend explicitly authorized the frontend origin. If the backend fails to send the proper headers, the browser blocks the response and outputs:
```
Access to fetch at 'http://localhost:8000/api/chat' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

> [!IMPORTANT]
> **CORS is configured on the backend, NOT the frontend!**
> No change in frontend React code can bypass browser CORS enforcement. The backend server must return the appropriate headers.

### What the Backend Must Allow During Development

- **Allowed Origins**: `http://localhost:5173` (and any local LAN IP if accessing over network, e.g. `http://192.168.1.*:5173`)
- **Allowed HTTP Methods**: `POST`, `OPTIONS`
- **Allowed HTTP Headers**: `Content-Type`

---

### Backend CORS Configuration Examples

#### 1. Python FastAPI Example
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Or ["*"] during local development testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 2. Node.js Express Example
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for frontend origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
```

#### 3. Python Flask Example
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
```

> [!WARNING]
> In production environments, never leave `allow_origins=["*"]`. Always restrict allowed origins to your production frontend domain (e.g. `https://weathergpt.yourdomain.com`).

---

## 15. End-to-End Communication Walkthrough

Here is what happens during a real user interaction:

### 1. User Action
The user opens `http://localhost:5173`, types:
> *"Do I need to carry an umbrella in Hyderabad today?"*
and presses **Enter**.

### 2. Frontend State & Location Gathering
- The frontend immediately appends the user's message to the conversation and renders a user speech bubble.
- An animated pulsing typing indicator (*"Thinking..."*) is displayed.
- The `LocationService` retrieves the user's coordinates (`latitude: 17.4933, longitude: 78.3917`).
- The frontend generates a session UUID (`conversationId: "e4a71b2d-9861-419b-a63e-fcf62d3a3910"`).

### 3. HTTP Request Dispatched
The frontend dispatches an HTTP `POST` request to `${VITE_API_BASE_URL}/api/chat`:

```http
POST /api/chat HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Accept: */*

{
  "message": "Do I need to carry an umbrella in Hyderabad today?",
  "conversationId": "e4a71b2d-9861-419b-a63e-fcf62d3a3910",
  "location": {
    "latitude": 17.4933,
    "longitude": 78.3917
  }
}
```

### 4. Backend Processing
1. The backend parses `location.latitude` and `location.longitude`.
2. It calls a weather provider API for those coordinates and discovers: Precipitation Probability: `75%`, Afternoon Thunderstorms expected.
3. The backend passes this weather context and the user query to its LLM prompt.
4. The LLM produces an insightful, conversational response.

### 5. HTTP Response Returned
The backend responds with HTTP 200:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:5173

{
  "response": "Yes, definitely take an umbrella! There is a 75% chance of scattered thunderstorms starting around 3 PM in Hyderabad with gusty winds.",
  "conversationId": "e4a71b2d-9861-419b-a63e-fcf62d3a3910"
}
```

### 6. Frontend Presentation
- The frontend receives the JSON object and verifies `typeof data.response === 'string'`.
- The typing indicator is dismissed.
- The assistant's reply animates smoothly onto the screen with a typewriter character-by-character reveal.
- The conversation title in the sidebar is automatically updated to reflect the conversation topic.

---

## 16. Testing the Connection & Network Inspection

Use this systematic checklist to verify that the frontend and backend are communicating properly.

### Verification Checklist

- [ ] **1. Start the Backend**: Ensure your backend server is running and prints that it is listening (e.g. on port `8000`).
- [ ] **2. Verify Frontend `.env`**: Ensure `VITE_API_BASE_URL` matches the backend address (e.g. `http://localhost:8000`).
- [ ] **3. Start Frontend**: Run `npm run dev` in `WeatherGPT/frontend/`.
- [ ] **4. Open Browser**: Navigate to `http://localhost:5173`.
- [ ] **5. Open Browser DevTools**:
  - On Windows: Press **`F12`** or **`Ctrl + Shift + I`**.
  - On macOS: Press **`Command (⌘) + Option + I`**.
  - Click on the **Network** tab in DevTools.
  - Filter network requests by clicking **Fetch/XHR**.
- [ ] **6. Send a Message**: Type *"What is the weather today?"* and press Enter.
- [ ] **7. Inspect the Network Request**:
  - In the Network list, look for an entry named **`chat`** (pointing to `/api/chat`).
  - Click on **`chat`**.
  - Inspect the **Headers** tab: Confirm `Request URL` matches your backend and `Status Code` is `200 OK`.
  - Inspect the **Payload** tab: Confirm the JSON body contains `message`, `conversationId`, and `location`.
  - Inspect the **Response** tab: Confirm the returned JSON has `{ "response": "...", "conversationId": "..." }`.
- [ ] **8. Confirm Chat Display**: Verify the assistant's message animates into view in the chat interface.

---

## 17. Comprehensive Troubleshooting Guide

### 1. Frontend Does Not Start (`command not found` or `vite: not found`)
- **Symptom**: Running `npm run dev` fails with `vite: command not found` or `The term 'vite' is not recognized`.
- **Cause**: Project dependencies were never installed in the current directory.
- **Fix**: Run `npm install` inside `WeatherGPT/frontend/`.

### 2. Node.js or npm Not Recognized in Terminal
- **Symptom**: `node: command not found` (Mac/Linux) or `The term 'node' is not recognized` (Windows).
- **Cause**: Node.js is either not installed or not in your system's `PATH` environment variable.
- **Fix**:
  - Windows: Download and run the Node.js installer from [nodejs.org](https://nodejs.org/). Restart PowerShell.
  - macOS: Download the `.pkg` installer from [nodejs.org](https://nodejs.org/) or run `brew install node`. Completely quit and reopen Terminal.

### 3. Dependencies Fail to Install (`npm install` errors)
- **Symptom**: `npm install` fails with `EACCES` or permission errors.
- **Cause**: You might be trying to install in a protected directory or with conflicting npm cache files.
- **Fix**:
  - Run `npm cache clean --force`.
  - Delete `package-lock.json` and try `npm install` again.
  - Never run `sudo npm install` — ensure the folder is owned by your user account.

### 4. Wrong Node.js Version
- **Symptom**: Build fails with syntax errors or unsupported engine warnings.
- **Cause**: Running Node.js version 14 or 16. The project requires Node.js `>= 18.0.0`.
- **Fix**: Check `node -v`. Update Node.js to version 20 LTS or 22 LTS via [nodejs.org](https://nodejs.org/) or `nvm install 20`.

### 5. Port 5173 Already in Use
- **Symptom**: Vite reports `Port 5173 is in use, trying another one...` and opens on `5174`.
- **Cause**: A previous Vite process is still running in the background.
- **Fix**:
  - Windows: Run `Get-Process node | Stop-Process -Force` in PowerShell.
  - macOS/Linux: Run `lsof -i :5173` to get the PID, then `kill -9 <PID>`.

### 6. Backend Cannot Be Reached (`Unable to connect to WeatherGPT server`)
- **Symptom**: Sending a message displays: *"Unable to connect to WeatherGPT server. Please check your connection."*
- **Cause**: The backend server is either not running, listening on a different port, or blocked by a firewall.
- **Fix**:
  - Check if the backend is actively running.
  - Verify that `VITE_API_BASE_URL` in `frontend/.env` matches the backend port.
  - Remember: whenever you edit `.env`, you must **restart the Vite dev server** (`Ctrl+C` then `npm run dev`) for changes to take effect!

### 7. CORS Error in Browser Console
- **Symptom**: Red error in browser DevTools: `Access to fetch at ... blocked by CORS policy`.
- **Cause**: The backend is not sending the `Access-Control-Allow-Origin` header for `http://localhost:5173`.
- **Fix**: Update the backend code to include CORS middleware allowing origin `http://localhost:5173` (see [Section 14](#14-cors-cross-origin-resource-sharing)).

### 8. 404 Not Found for `/api/chat`
- **Symptom**: Assistant displays: *"Server returned 404: Not Found"*.
- **Cause**: The backend does not have a route registered at `/api/chat` (e.g. it might be registered at `/chat` or `/api/v1/chat`).
- **Fix**: Ensure the backend route is registered as `POST /api/chat`.

### 9. Backend Returns 500 Internal Server Error
- **Symptom**: Assistant displays: *"Server returned 500: Internal Server Error"*.
- **Cause**: The backend crashed while processing the request (e.g. invalid weather API key, missing environment variable on the backend, or uncaught exception).
- **Fix**: Inspect the terminal output of your backend server to read the stack trace.

### 10. Location Permission Denied
- **Symptom**: Chat sends `"location": null` every time.
- **Cause**: The user clicked "Block" or "Don't Allow" on the browser geolocation prompt.
- **Fix**:
  - Chrome: Click the tune icon/padlock to the left of the URL bar → Permissions → Reset Location to "Allow" or "Ask".
  - Safari: Safari Settings → Websites → Location → Change `localhost` to "Allow".

### 11. Location Prompt Timed Out
- **Symptom**: The first message sent has `location: null` even though permission was not denied.
- **Cause**: The browser geolocation prompt was ignored for more than 4 seconds. The frontend safety timeout kicked in to prevent the chat from freezing.
- **Fix**: Refresh the page and click "Allow" promptly when the prompt appears.

### 12. Changes to `.env` Are Not Taking Effect
- **Symptom**: You changed `VITE_API_BASE_URL=http://localhost:8000`, but requests still go to `3001`.
- **Cause**: Vite reads `.env` files only when the development server boots.
- **Fix**: Stop Vite (`Ctrl + C`) and run `npm run dev` again.

### 13. Backend Works on One Computer But Fails from Another Computer
- **Symptom**: Teammate's frontend cannot reach your backend on the same Wi-Fi.
- **Cause**:
  1. Backend is listening only on `127.0.0.1` instead of `0.0.0.0`.
  2. Operating system firewall is blocking incoming connections on the backend port.
  3. Computers are connected to different Wi-Fi networks (e.g. one on guest Wi-Fi, one on main).
- **Fix**: Bind backend to `0.0.0.0`, allow the port in firewall, and verify both computers are on the same Wi-Fi subnet.

---

## 18. Production & Deployment Considerations

When moving WeatherGPT from local development to production:

1. **Localhost is for Local Development Only**:
   - In production, `http://localhost:5173` and `http://localhost:8000` do not exist for end users.
   - Deploy the frontend to a web host (e.g., Vercel, Netlify, Cloudflare Pages, AWS CloudFront + S3).
   - Deploy the backend to a cloud container/server (e.g., Google Cloud Run, AWS ECS/App Runner, DigitalOcean, Render).

2. **Set Production API URL at Build Time**:
   - In your frontend deployment dashboard or production environment, set:
     ```env
     VITE_API_BASE_URL=https://api.yourdomain.com
     ```
   - Run `npm run build` so Vite injects the production URL into the static bundle.

3. **HTTPS is Mandatory for Geolocation in Production**:
   - Browsers permit Geolocation on unencrypted `http://` **only for localhost**.
   - On public domains, browsers strictly block `navigator.geolocation` unless the site is served over **HTTPS** (`https://`). Both your frontend and backend must use valid SSL/TLS certificates in production.

4. **Production CORS Configuration**:
   - In production, configure the backend CORS middleware to whitelist only your production frontend domain (e.g. `https://weathergpt.yourdomain.com`), disallowing untrusted origins.

---

## 19. Backend Developer Handoff Specification

If you are a backend engineer building an API service for WeatherGPT, here is the exact specification you need to implement. You do not need to examine the frontend source code.

### Required Endpoint Summary

| Property | Value |
| :--- | :--- |
| **Endpoint** | `/api/chat` |
| **HTTP Method** | `POST` |
| **Consumes** | `application/json` |
| **Produces** | `application/json` |
| **Timeout Limit** | Return within **30 seconds** (frontend timeout) |
| **Required Status Code** | `200 OK` on success |

### Request Schema
```json
{
  "message": "string (Required. The user prompt)",
  "conversationId": "string (Optional/Recommended. Unique session UUID)",
  "location": {
    "latitude": "number (Float, e.g. 17.4933)",
    "longitude": "number (Float, e.g. 78.3917)"
  }
}
```
*(Note: If coordinates are unavailable or permission is denied, `"location": null` will be sent).*

### Response Schema
```json
{
  "response": "string (Required. The assistant's conversational reply)",
  "conversationId": "string (Required. Echo back or generate the session ID)"
}
```

### Required CORS Headers
```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

### Ready-to-Run Mock Backend Stubs (Test in 2 Minutes)

You can copy and run either of these lightweight backend stubs to immediately test the frontend connection.

#### Option A: Python (FastAPI) Stub
Save as `server.py`:
```python
# pip install fastapi uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Location(BaseModel):
    latitude: float
    longitude: float

class ChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None
    location: Optional[Location] = None

class ChatResponse(BaseModel):
    response: str
    conversationId: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    loc_info = f"at ({req.location.latitude}, {req.location.longitude})" if req.location else "(location unavailable)"
    reply = f"Hello! You asked: '{req.message}'. Your location is {loc_info}. It is currently 24°C and partly cloudy."
    return ChatResponse(response=reply, conversationId=req.conversationId or "default-session")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
Run with: `python server.py`.

#### Option B: Node.js (Express) Stub
Save as `server.js`:
```javascript
// npm install express cors
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { message, conversationId, location } = req.body;
  const locInfo = location ? `at (${location.latitude}, ${location.longitude})` : '(location unavailable)';
  const reply = `Hello! You asked: "${message}". Your location is ${locInfo}. It's currently 24°C and partly cloudy.`;

  res.json({
    response: reply,
    conversationId: conversationId || 'session-1'
  });
});

app.listen(8000, () => {
  console.log('Mock WeatherGPT backend listening on http://localhost:8000');
});
```
Run with: `node server.js`.

---

## 20. Frontend Developer Onboarding Checklist

If you are a new frontend developer taking over this project, follow this 9-step quickstart:

1. **Clone or Copy Repository**: Ensure the `WeatherGPT/` folder is on your local machine.
2. **Navigate to the Frontend Directory**:
   ```bash
   cd WeatherGPT/frontend
   ```
3. **Verify Node.js**:
   ```bash
   node -v    # Must be v18.0.0 or higher
   npm -v     # Must be v9.0.0 or higher
   ```
4. **Install Dependencies**:
   ```bash
   npm install
   ```
5. **Create Local Environment File**:
   ```bash
   cp .env.example .env          # On macOS / Linux
   Copy-Item .env.example .env   # On Windows PowerShell
   ```
6. **Set Backend URL**: Open `.env` and verify `VITE_API_BASE_URL` matches your backend's host and port.
7. **Start the Development Server**:
   ```bash
   npm run dev
   ```
8. **Open in Browser**: Visit `http://localhost:5173`.
9. **Verify Build**:
   ```bash
   npm run build
   ```
   Confirm TypeScript type checking passes and generates `dist/` without errors.

---

*WeatherGPT Frontend — Built with React 18, TypeScript 5, Vite 6, and Tailwind CSS 3.*
