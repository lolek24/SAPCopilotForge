# SAPCopilotForge

An intelligent SAP ERP assistant with a built-in AI agent. The application combines a SAP Fiori interface with a conversational AI panel (SAP AI Copilot) that allows users to query SAP data using natural language — purchase orders, materials, finances and invoices.

The AI agent analyzes user queries, classifies the relevant SAP module (MM, SD, FI), fetches the appropriate data and generates clear responses in Polish.

## Screenshots

### Dashboard with AI Copilot panel
![Dashboard](screenshot/Zrzut%20ekranu%202026-03-09%20121230.png)

### AI agent conversation
![Chat AI](screenshot/Zrzut%20ekranu%202026-03-09%20122515.png)

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | SAPUI5 / OpenUI5 (sap_horizon theme, Fiori design) |
| **Backend** | Node.js + Express 5 |
| **AI Agent** | Python + LangGraph + LangChain |
| **LLM Model** | Claude (Anthropic) via langchain-anthropic |
| **Agent API** | FastAPI + Uvicorn |

### Frontend — SAPUI5 Fiori
- Native SAP Fiori interface built on **OpenUI5** (CDN)
- **sap_horizon** theme — SAP's latest design system
- Views: Dashboard, Orders, Materials, Finance
- Built-in **SAP AI Copilot** panel — chat with the AI agent directly in the UI
- Natural language navigation from the chat (e.g. *"show orders"*)
- Components: `tnt:ToolPage`, `SplitApp`, `GenericTile`, `IconTabBar`, `Table`

### Backend — Node.js Express
- **Express 5** server serving static SAPUI5 files
- API proxy forwarding requests to the Python agent
- Endpoints: `/api/chat`, `/api/agent/query`, `/api/agent/create`, `/api/health`
- Automatic fallback to mock data when the agent is offline

### AI Agent — Python LangGraph
- **LangGraph** state graph with stages: intent classification → SAP data retrieval → response generation
- **Claude** (Anthropic) as the LLM engine
- **FastAPI** server with REST endpoints
- SAP module support: **MM** (purchasing/materials), **SD** (sales), **FI** (finance)
- Mock data layer simulating SAP system responses

## Requirements

- **Node.js** >= 18
- **Python** >= 3.10
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com/)

## Installation

### 1. Node.js dependencies

```bash
npm install
```

### 2. Python dependencies (AI agent)

```bash
npm run agent:install
```

### 3. API key configuration

Edit the `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY
LANGGRAPH_AGENT_URL=http://localhost:8000
```

## Running

You need **two terminals** running simultaneously:

### Terminal 1 — Node.js server (port 3000)

```bash
npm run dev
```

### Terminal 2 — Python AI agent (port 8000)

```bash
npm run agent:start
```

The application is available at: **http://localhost:3000**

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Node.js server with auto-reload |
| `npm run start` | Node.js server (production) |
| `npm run agent:start` | Python AI agent (LangGraph) |
| `npm run agent:install` | Install Python dependencies |

## Architecture

```
Node.js Express (port 3000)
├── Serves SAPUI5 static files from webapp/
├── POST /api/agent/query  — proxy to AI agent
├── POST /api/agent/create — proxy to AI agent
├── POST /api/chat         — proxy to AI agent /chat
└── GET  /api/health       — server status

SAPUI5 Fiori (webapp/)
├── Dashboard  — KPIs + orders table + quick actions
├── Orders     — purchase orders list with filters
├── Materials  — materials inventory
├── Finance    — invoices and financial KPIs
└── SAP AI Copilot — AI agent chat panel

Python Agent (agent/, port 8000)
├── server.py — FastAPI: /query, /create, /chat, /health
└── agent.py  — LangGraph: classification → SAP data → Claude response
```

## Troubleshooting

**"Cannot connect to AI agent"**
- Make sure the Python agent is running (`npm run agent:start`)
- Check that `ANTHROPIC_API_KEY` is set in `.env.local`

**Agent won't start**
- Install dependencies: `npm run agent:install`
- Check Python version: `python --version` (requires >= 3.10)

**Application doesn't load in browser**
- Make sure the Node.js server is running (`npm run dev`)
- Open http://localhost:3000
