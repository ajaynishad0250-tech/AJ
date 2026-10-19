import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.get("/health", (_req, res) => res.json({ ok: true, service: "AJAY JARVIS AI" }));

app.post("/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const language = req.body?.language === "en" ? "en" : "hi";
  if (!message || message.length > 4000) return res.status(400).json({ error: "message_required_or_too_long" });
  if (!process.env.AI_API_KEY) return res.status(503).json({ error: "ai_provider_not_configured" });
  try {
    const upstream = await fetch(process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.AI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: language === "hi"
            ? "आप AJAY JARVIS AI हैं। विनम्रता से हिंदी या English में जवाब दें। फोन पर कार्रवाई करने का दावा न करें। संवेदनशील कार्रवाई से पहले स्पष्ट पुष्टि आवश्यक है।"
            : "You are AJAY JARVIS AI. Reply helpfully in English or Hindi. Never claim to have changed phone settings or performed external actions. Require explicit confirmation for sensitive actions." },
          { role: "user", content: message }
        ],
        temperature: 0.6
      })
    });
    if (!upstream.ok) {
      console.error("AI provider status:", upstream.status);
      return res.status(502).json({ error: "ai_provider_error" });
    }
    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return res.status(502).json({ error: "empty_ai_reply" });
    return res.json({ reply: reply.trim() });
  } catch (error) {
    console.error("AI request failed:", error?.message || "unknown_error");
    return res.status(502).json({ error: "ai_request_failed" });
  }
});
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log("AJAY JARVIS AI backend listening on " + port));
