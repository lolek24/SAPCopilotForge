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
| **LLM** | Multi-provider: Anthropic, OpenAI, Google Gemini, Ollama |
| **Agent API** | FastAPI + Uvicorn |

### Frontend — SAPUI5 Fiori
- Native SAP Fiori interface built on **OpenUI5** (CDN)
- **sap_horizon** theme — SAP's latest design system
- Views: Dashboard, Orders, Materials, Finance
- Built-in **SAP AI Copilot** panel — chat with the AI agent directly in the UI
- Natural language navigation from the chat (e.g. *"show orders"*)
- Edit & resend previous messages in the chat
- Full i18n support (Polish)
- Components: `tnt:ToolPage`, `SplitApp`, `GenericTile`, `IconTabBar`, `Table`

### Backend — Node.js Express
- **Express 5** server serving static SAPUI5 files
- API proxy forwarding requests to the Python agent
- CORS support and global error handling
- Endpoints: `/api/chat`, `/api/agent/query`, `/api/agent/create`, `/api/health`
- Automatic fallback to mock data when the agent is offline

### AI Agent — Python LangGraph
- **LangGraph** state graph with stages: intent classification → SAP data retrieval → response generation
- **Multi-provider LLM** — switch between providers with a single env variable
- **FastAPI** server with REST endpoints
- SAP module support: **MM** (purchasing/materials), **SD** (sales), **FI** (finance)
- Mock data layer simulating SAP system responses

## Supported LLM Providers

| Provider | `LLM_PROVIDER` | API Key Variable | Default Model | Install |
|---|---|---|---|---|
| **Anthropic** | `anthropic` | `ANTHROPIC_API_KEY` | claude-sonnet-4-20250514 | included |
| **OpenAI** | `openai` | `OPENAI_API_KEY` | gpt-4o | included |
| **Google Gemini** | `google` | `GOOGLE_API_KEY` | gemini-2.0-flash | `pip install langchain-google-genai` |
| **Ollama** (local) | `ollama` | — (free) | llama3.1 | `pip install langchain-ollama` |

If `LLM_PROVIDER` is not set, the agent auto-detects the provider based on which API key is available.

You can override the model with `LLM_MODEL` in `.env.local`.

## Requirements

- **Node.js** >= 18
- **Python** >= 3.10
- **LLM API key** — at least one of: [Anthropic](https://console.anthropic.com/), [OpenAI](https://platform.openai.com/), [Google](https://aistudio.google.com/), or local [Ollama](https://ollama.com/)

## Installation

### 1. Node.js dependencies

```bash
npm install
```

### 2. Python dependencies (AI agent)

```bash
npm run agent:install
```

### 3. LLM configuration

Copy the example and edit `.env.local`:

```bash
cp .env.example .env.local
```

**Anthropic (default):**
```env
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY
```

**OpenAI:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-YOUR_KEY
```

**Google Gemini:**
```env
LLM_PROVIDER=google
GOOGLE_API_KEY=YOUR_KEY
```

**Ollama (free, local):**
```env
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1
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

```mermaid
graph TB
    subgraph Browser["Browser"]
        UI["SAPUI5 Fiori App<br/><i>sap_horizon theme</i>"]
        subgraph Views["Views"]
            V1["Dashboard"]
            V2["Orders"]
            V3["Materials"]
            V4["Finance"]
        end
        Chat["SAP AI Copilot<br/><i>Chat Panel</i>"]
        UI --- Views
        UI --- Chat
    end

    subgraph NodeServer["Node.js Express :3000"]
        Static["Static Files<br/><i>webapp/</i>"]
        API_Chat["POST /api/chat"]
        API_Query["POST /api/agent/query"]
        API_Create["POST /api/agent/create"]
        API_Health["GET /api/health"]
        Mock["Mock Data<br/><i>fallback offline</i>"]
    end

    subgraph PythonAgent["Python Agent :8000"]
        FastAPI["FastAPI Server"]
        subgraph LangGraph["LangGraph StateGraph"]
            Classify["Classify Intent<br/><i>MM · SD · FI</i>"]
            Fetch["Fetch SAP Data<br/><i>mock layer</i>"]
            Generate["Generate Response"]
            Create["Create Document"]
            Classify --> Fetch
            Fetch -->|query/analyze| Generate
            Fetch -->|create| Create
        end
        FastAPI --- LangGraph
    end

    subgraph LLM["LLM Provider"]
        Anthropic["Anthropic<br/><i>Claude</i>"]
        OpenAI["OpenAI<br/><i>GPT-4o</i>"]
        Google["Google<br/><i>Gemini</i>"]
        Ollama["Ollama<br/><i>local</i>"]
    end

    Browser -->|"HTTP"| NodeServer
    NodeServer -->|"static files"| Browser
    API_Chat -->|"proxy"| FastAPI
    API_Query -->|"proxy"| FastAPI
    API_Create -->|"proxy"| FastAPI
    Generate -->|"API call"| LLM
    Create -->|"API call"| LLM

    style Browser fill:#e8f4fd,stroke:#1a73e8,color:#000
    style NodeServer fill:#e6f4ea,stroke:#34a853,color:#000
    style PythonAgent fill:#fef7e0,stroke:#f9ab00,color:#000
    style LLM fill:#fce8e6,stroke:#ea4335,color:#000
    style LangGraph fill:#fff8e1,stroke:#f9ab00,color:#000
    style Views fill:#e8f0fe,stroke:#4285f4,color:#000
```

### Request Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as SAPUI5 Chat
    participant Node as Express :3000
    participant Agent as FastAPI :8000
    participant Graph as LangGraph
    participant LLM as LLM Provider

    User->>UI: types message
    UI->>Node: POST /api/chat
    Node->>Agent: proxy POST /chat
    Agent->>Graph: run_query()
    Graph->>Graph: classify_intent()
    Graph->>Graph: fetch_sap_data()
    Graph->>LLM: generate_response()
    LLM-->>Graph: AI response
    Graph-->>Agent: result
    Agent-->>Node: JSON response
    Node-->>UI: JSON response
    UI-->>User: display message

    Note over Node,Agent: If agent offline,<br/>Node returns mock data
```

## Troubleshooting

**"Cannot connect to AI agent"**
- Make sure the Python agent is running (`npm run agent:start`)
- Check that your API key is set in `.env.local`

**Agent won't start**
- Install dependencies: `npm run agent:install`
- Check Python version: `python --version` (requires >= 3.10)

**Wrong LLM provider**
- Check active provider: `curl http://localhost:8000/health`
- Set `LLM_PROVIDER` explicitly in `.env.local`

**Application doesn't load in browser**
- Make sure the Node.js server is running (`npm run dev`)
- Open http://localhost:3000
