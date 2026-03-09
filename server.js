const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const AGENT_URL = process.env.LANGGRAPH_AGENT_URL || "http://localhost:8000";

// Parse JSON body
app.use(express.json({ limit: "100kb" }));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// --- API Routes ---

// Proxy to LangGraph agent
app.post("/api/agent/query", async (req, res) => {
  try {
    const response = await fetch(`${AGENT_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) {
      throw new Error(`Agent responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("[/api/agent/query] Agent error:", err.message);
    // Fallback mock data when agent is offline
    res.json({
      orders: [
        { id: "PO-4500001234", vendor: "SAP SE", amount: 12500, status: "approved" },
        { id: "PO-4500001235", vendor: "Microsoft", amount: 8200, status: "pending" },
      ],
      message: "Dane demonstracyjne (agent offline)",
    });
  }
});

app.post("/api/agent/create", async (req, res) => {
  try {
    const response = await fetch(`${AGENT_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) {
      throw new Error(`Agent responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("[/api/agent/create] Agent error:", err.message);
    res.json({
      id: `MOCK-${Date.now()}`,
      status: "created",
      message: "Dokument utworzony (tryb demo)",
    });
  }
});

// Chat endpoint — streams responses from LangGraph agent
app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch(`${AGENT_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) {
      throw new Error(`Agent responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("[/api/chat] Agent error:", err.message);
    const message = req.body && req.body.message ? req.body.message : "";
    res.json({
      response: message
        ? `Otrzymałem zapytanie: "${message}". Agent LangGraph jest offline — uruchom go komendą: npm run agent:start`
        : "Agent LangGraph jest offline — uruchom go komendą: npm run agent:start",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.message);
  res.status(500).json({ error: "Wewnętrzny błąd serwera" });
});

// --- Serve SAPUI5 static files ---
app.use(express.static(path.join(__dirname, "webapp")));

// SPA fallback — all other routes serve index.html
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp", "index.html"));
});

app.listen(PORT, () => {
  console.log(`SAPCopilotForge running at http://localhost:${PORT}`);
  console.log(`LangGraph Agent expected at ${AGENT_URL}`);
});
