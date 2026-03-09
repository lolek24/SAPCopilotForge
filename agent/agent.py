"""
LangGraph SAP Agent - Graph Definition
Implements a multi-step agent for SAP ERP operations using LangGraph.
Supports multiple LLM providers: Anthropic, OpenAI, Google, Ollama.
"""

import os
from typing import Annotated, TypedDict, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage, HumanMessage


# --- State Definition ---
class SAPAgentState(TypedDict):
    messages: Annotated[list, add_messages]
    sap_module: str
    query_type: str  # "query" | "create" | "analyze"
    sap_data: dict
    result: dict


# --- LLM Setup (lazy init to avoid requiring API key at import time) ---
_llm = None

LLM_PROVIDERS = {
    "anthropic": {
        "module": "langchain_anthropic",
        "class": "ChatAnthropic",
        "default_model": "claude-sonnet-4-20250514",
        "env_key": "ANTHROPIC_API_KEY",
    },
    "openai": {
        "module": "langchain_openai",
        "class": "ChatOpenAI",
        "default_model": "gpt-4o",
        "env_key": "OPENAI_API_KEY",
    },
    "google": {
        "module": "langchain_google_genai",
        "class": "ChatGoogleGenerativeAI",
        "default_model": "gemini-2.0-flash",
        "env_key": "GOOGLE_API_KEY",
    },
    "ollama": {
        "module": "langchain_ollama",
        "class": "ChatOllama",
        "default_model": "llama3.1",
        "env_key": None,
    },
}


def _detect_provider() -> str:
    """Detect LLM provider from env or auto-detect by available API key."""
    explicit = os.getenv("LLM_PROVIDER", "").lower().strip()
    if explicit and explicit in LLM_PROVIDERS:
        return explicit

    # Auto-detect by checking which API key is set
    for name, cfg in LLM_PROVIDERS.items():
        if cfg["env_key"] and os.getenv(cfg["env_key"]):
            return name

    return "anthropic"


def get_llm():
    """Initialize LLM based on LLM_PROVIDER env variable."""
    global _llm
    if _llm is not None:
        return _llm

    import importlib

    provider_name = _detect_provider()
    provider = LLM_PROVIDERS[provider_name]
    model_name = os.getenv("LLM_MODEL", provider["default_model"])

    mod = importlib.import_module(provider["module"])
    cls = getattr(mod, provider["class"])

    if provider_name == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        _llm = cls(model=model_name, base_url=base_url, temperature=0)
    else:
        _llm = cls(model=model_name, temperature=0)

    print(f"[LLM] Provider: {provider_name} | Model: {model_name}", flush=True)
    return _llm


SAP_SYSTEM_PROMPT = """Jesteś ekspertem SAP ERP. Twoim zadaniem jest:
1. Analizowanie zapytań użytkownika dotyczących systemu SAP
2. Identyfikowanie odpowiedniego modułu SAP (MM, SD, FI, PP, HR, WM)
3. Generowanie odpowiednich danych i odpowiedzi
4. Pomaganie w tworzeniu dokumentów SAP

Odpowiadaj zawsze po polsku. Bądź precyzyjny i merytoryczny.
NIGDY nie zwracaj surowych danych JSON ani bloków kodu w odpowiedzi.
Zawsze prezentuj dane w formie czytelnego tekstu, list punktowanych lub tabel.
Formatuj liczby z separatorami tysięcy i odpowiednią walutą."""


# --- Mock SAP Data Layer ---
MOCK_SAP_DATA = {
    "MM": {
        "purchase_orders": [
            {"id": "PO-4500001234", "vendor": "SAP SE", "amount": 12500.00, "currency": "EUR", "status": "approved", "date": "2026-03-07"},
            {"id": "PO-4500001235", "vendor": "Microsoft Corp", "amount": 8200.00, "currency": "EUR", "status": "pending", "date": "2026-03-08"},
            {"id": "PO-4500001236", "vendor": "AWS Inc", "amount": 45000.00, "currency": "EUR", "status": "pending", "date": "2026-03-08"},
        ],
        "materials": [
            {"id": "MAT-100001", "name": "Laptop ThinkPad X1", "stock": 150, "unit": "SZT", "plant": "1000"},
            {"id": "MAT-100002", "name": "Monitor 27\" 4K", "stock": 85, "unit": "SZT", "plant": "1000"},
        ],
    },
    "SD": {
        "sales_orders": [
            {"id": "SO-0001001234", "customer": "Acme Corp", "amount": 25000.00, "currency": "EUR", "status": "delivered"},
            {"id": "SO-0001001235", "customer": "TechStart GmbH", "amount": 15750.00, "currency": "EUR", "status": "processing"},
        ],
    },
    "FI": {
        "invoices": [
            {"id": "INV-9000001001", "vendor": "SAP SE", "amount": 12500.00, "currency": "EUR", "status": "paid", "due_date": "2026-04-07"},
            {"id": "INV-9000001002", "vendor": "AWS Inc", "amount": 45000.00, "currency": "EUR", "status": "open", "due_date": "2026-04-08"},
        ],
        "gl_balance": {"total_assets": 2450000, "total_liabilities": 980000, "equity": 1470000},
    },
}


# --- Graph Nodes ---
def classify_intent(state: SAPAgentState) -> SAPAgentState:
    """Classify the user's intent and determine the SAP module."""
    messages = state["messages"]
    last_message = messages[-1].content if messages else ""

    # Simple classification logic
    query_lower = last_message.lower()

    if any(w in query_lower for w in ["zamówienie zakupu", "purchase order", "po", "materiał", "magazyn", "stock"]):
        module = "MM"
    elif any(w in query_lower for w in ["sprzedaż", "sales", "klient", "customer", "dostawa"]):
        module = "SD"
    elif any(w in query_lower for w in ["faktura", "invoice", "finans", "bilans", "księgow"]):
        module = "FI"
    else:
        module = state.get("sap_module", "MM")

    if any(w in query_lower for w in ["utwórz", "create", "nowy", "dodaj"]):
        query_type = "create"
    elif any(w in query_lower for w in ["analizuj", "raport", "podsumowanie", "analyze", "trend"]):
        query_type = "analyze"
    else:
        query_type = "query"

    return {**state, "sap_module": module, "query_type": query_type}


def fetch_sap_data(state: SAPAgentState) -> SAPAgentState:
    """Fetch data from SAP (mock layer)."""
    module = state.get("sap_module", "MM")
    data = MOCK_SAP_DATA.get(module, {})
    return {**state, "sap_data": data}


def generate_response(state: SAPAgentState) -> SAPAgentState:
    """Generate a natural language response using LLM."""
    messages = [
        SystemMessage(content=SAP_SYSTEM_PROMPT),
        HumanMessage(content=f"""
Moduł SAP: {state.get('sap_module', 'N/A')}
Typ zapytania: {state.get('query_type', 'query')}
Dane SAP: {state.get('sap_data', {})}

Zapytanie użytkownika: {state['messages'][-1].content if state['messages'] else 'brak'}

Przygotuj odpowiedź na zapytanie użytkownika na podstawie powyższych danych SAP.
"""),
    ]

    response = get_llm().invoke(messages)

    return {
        **state,
        "messages": [*state["messages"], response],
        "result": {
            "module": state.get("sap_module"),
            "data": state.get("sap_data"),
            "response": response.content,
        },
    }


def create_document(state: SAPAgentState) -> SAPAgentState:
    """Handle SAP document creation."""
    import random
    doc_id = f"DOC-{random.randint(1000000, 9999999)}"

    messages = [
        SystemMessage(content=SAP_SYSTEM_PROMPT),
        HumanMessage(content=f"""
Użytkownik chce utworzyć nowy dokument w module {state.get('sap_module', 'MM')}.
Zapytanie: {state['messages'][-1].content if state['messages'] else 'brak'}

Potwierdź utworzenie dokumentu o ID: {doc_id} i opisz co zostało utworzone.
"""),
    ]

    response = get_llm().invoke(messages)

    return {
        **state,
        "messages": [*state["messages"], response],
        "result": {"id": doc_id, "status": "created", "response": response.content},
    }


def route_by_type(state: SAPAgentState) -> Literal["generate_response", "create_document"]:
    """Route to the appropriate node based on query type."""
    if state.get("query_type") == "create":
        return "create_document"
    return "generate_response"


# --- Build Graph ---
workflow = StateGraph(SAPAgentState)

workflow.add_node("classify_intent", classify_intent)
workflow.add_node("fetch_sap_data", fetch_sap_data)
workflow.add_node("generate_response", generate_response)
workflow.add_node("create_document", create_document)

workflow.set_entry_point("classify_intent")
workflow.add_edge("classify_intent", "fetch_sap_data")
workflow.add_conditional_edges("fetch_sap_data", route_by_type)
workflow.add_edge("generate_response", END)
workflow.add_edge("create_document", END)

sap_graph = workflow.compile()


# --- Helper Functions for Direct API ---
async def run_query(query: str, module: str) -> dict:
    """Run a query through the LangGraph agent."""
    initial_state: SAPAgentState = {
        "messages": [HumanMessage(content=query)],
        "sap_module": module,
        "query_type": "query",
        "sap_data": {},
        "result": {},
    }
    final_state = await sap_graph.ainvoke(initial_state)
    return final_state.get("result", {})


async def run_create(document_type: str, details: dict) -> dict:
    """Create a document through the LangGraph agent."""
    initial_state: SAPAgentState = {
        "messages": [HumanMessage(content=f"Utwórz dokument {document_type}: {details}")],
        "sap_module": "MM",
        "query_type": "create",
        "sap_data": {},
        "result": {},
    }
    final_state = await sap_graph.ainvoke(initial_state)
    return final_state.get("result", {})
