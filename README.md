# SAPCopilotForge

Inteligentny asystent SAP ERP z wbudowanym agentem AI. Aplikacja łączy interfejs SAP Fiori z konwersacyjnym panelem AI (SAP AI Copilot), który umożliwia zadawanie pytań o dane SAP w języku naturalnym — zamówienia zakupu, materiały, finanse i faktury.

Agent AI analizuje zapytania użytkownika, klasyfikuje moduł SAP (MM, SD, FI), pobiera odpowiednie dane i generuje czytelne odpowiedzi po polsku.

## Zrzuty ekranu

### Dashboard z panelem AI Copilot
![Dashboard](screenshot/Zrzut%20ekranu%202026-03-09%20121230.png)

### Konwersacja z agentem AI
![Chat AI](screenshot/Zrzut%20ekranu%202026-03-09%20122515.png)

## Stos technologiczny

| Warstwa | Technologia |
|---|---|
| **Frontend** | SAPUI5 / OpenUI5 (sap_horizon theme, Fiori design) |
| **Backend** | Node.js + Express 5 |
| **Agent AI** | Python + LangGraph + LangChain |
| **Model LLM** | Claude (Anthropic) via langchain-anthropic |
| **API agenta** | FastAPI + Uvicorn |
| **Proxy** | http-proxy-middleware |

### Frontend — SAPUI5 Fiori
- Natywny interfejs SAP Fiori oparty o bibliotekę **OpenUI5** (CDN)
- Motyw **sap_horizon** — najnowszy design system SAP
- Widoki: Dashboard, Zamówienia, Materiały, Finanse
- Wbudowany panel **SAP AI Copilot** — czat z agentem AI bezpośrednio w interfejsie
- Nawigacja głosowa po aplikacji z poziomu czatu (np. *"pokaż zamówienia"*)
- Komponenty: `tnt:ToolPage`, `SplitApp`, `GenericTile`, `IconTabBar`, `Table`

### Backend — Node.js Express
- Serwer **Express 5** serwujący pliki statyczne SAPUI5
- Proxy API przekierowujące zapytania do agenta Python
- Endpointy: `/api/chat`, `/api/agent/query`, `/api/agent/create`, `/api/health`
- Automatyczny fallback na dane mockowe gdy agent jest offline

### Agent AI — Python LangGraph
- Graf stanowy **LangGraph** z etapami: klasyfikacja intencji → pobranie danych SAP → generowanie odpowiedzi
- Model **Claude** (Anthropic) jako silnik LLM
- Serwer **FastAPI** z endpointami REST
- Obsługa modułów SAP: **MM** (zakupy/materiały), **SD** (sprzedaż), **FI** (finanse)
- Warstwa danych mockowych symulująca odpowiedzi systemu SAP

## Wymagania

- **Node.js** >= 18
- **Python** >= 3.10
- **Klucz API Anthropic** — [console.anthropic.com](https://console.anthropic.com/)

## Instalacja

### 1. Zależności Node.js

```bash
npm install
```

### 2. Zależności Pythona (agent AI)

```bash
npm run agent:install
```

### 3. Konfiguracja klucza API

Edytuj plik `.env.local` w katalogu głównym projektu:

```
ANTHROPIC_API_KEY=sk-ant-TWOJ_KLUCZ
LANGGRAPH_AGENT_URL=http://localhost:8000
```

## Uruchamianie

Potrzebne są **dwa terminale** uruchomione równolegle:

### Terminal 1 — Serwer Node.js (port 3000)

```bash
npm run dev
```

### Terminal 2 — Agent AI Python (port 8000)

```bash
npm run agent:start
```

Aplikacja dostępna pod adresem: **http://localhost:3000**

## Komendy

| Komenda | Opis |
|---|---|
| `npm run dev` | Serwer Node.js z auto-reload |
| `npm run start` | Serwer Node.js (produkcja) |
| `npm run agent:start` | Agent AI Python (LangGraph) |
| `npm run agent:install` | Instalacja zależności Pythona |

## Architektura

```
Node.js Express (port 3000)
├── Serwuje pliki SAPUI5 z katalogu webapp/
├── POST /api/agent/query  — proxy do agenta AI
├── POST /api/agent/create — proxy do agenta AI
├── POST /api/chat         — proxy do agenta AI /chat
└── GET  /api/health       — status serwera

SAPUI5 Fiori (webapp/)
├── Dashboard  — KPI + tabela zamówień + szybkie akcje
├── Zamówienia — lista zamówień zakupu z filtrami
├── Materiały  — magazyn materiałów
├── Finanse    — faktury i wskaźniki finansowe
└── SAP AI Copilot — panel czatu z agentem AI

Agent Python (agent/, port 8000)
├── server.py — FastAPI: /query, /create, /chat, /health
└── agent.py  — LangGraph: klasyfikacja → dane SAP → odpowiedź Claude
```

## Rozwiązywanie problemów

**"Nie mogę połączyć się z agentem AI"**
- Upewnij się, że agent Python jest uruchomiony (`npm run agent:start`)
- Sprawdź czy `ANTHROPIC_API_KEY` jest ustawiony w `.env.local`

**Agent nie startuje**
- Zainstaluj zależności: `npm run agent:install`
- Sprawdź wersję Pythona: `python --version` (wymagany >= 3.10)

**Aplikacja nie ładuje się w przeglądarce**
- Sprawdź czy serwer Node.js działa (`npm run dev`)
- Otwórz http://localhost:3000
