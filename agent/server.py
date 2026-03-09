"""
LangGraph SAP Agent - FastAPI Server
Provides SAP data querying, document creation and chat via LangGraph workflows.
"""

# Load environment variables from .env.local
from dotenv import load_dotenv
import os
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"), override=True)
import logging
logging.basicConfig(level=logging.INFO)

# Compatibility patch: copilotkit imports from langgraph.graph.graph which
# was removed in langgraph 0.5+. Bridge it to the new location.
import types
import sys
import langgraph.graph
from langgraph.graph.state import CompiledStateGraph
_compat = types.ModuleType("langgraph.graph.graph")
_compat.CompiledGraph = CompiledStateGraph
sys.modules["langgraph.graph.graph"] = _compat

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import sap_graph, run_query, run_create

app = FastAPI(title="SAP LangGraph Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request Models ---
class QueryRequest(BaseModel):
    query: str
    module: str = "general"


class CreateRequest(BaseModel):
    documentType: str
    details: dict


class ChatRequest(BaseModel):
    message: str


# --- API Endpoints ---
@app.post("/query")
async def query_sap_data(request: QueryRequest):
    """Query SAP data through the LangGraph agent."""
    result = await run_query(request.query, request.module)
    return result


@app.post("/create")
async def create_sap_document(request: CreateRequest):
    """Create an SAP document through the LangGraph agent."""
    result = await run_create(request.documentType, request.details)
    return result


@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with the SAP AI agent — used by SAPUI5 chat panel."""
    import traceback
    try:
        result = await run_query(request.message, "general")
        return {"response": result.get("response", str(result))}
    except Exception as e:
        tb = traceback.format_exc()
        print(f"CHAT ERROR: {tb}", flush=True)
        return {"response": f"Błąd agenta: {str(e)}"}


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "sap_langgraph"}
