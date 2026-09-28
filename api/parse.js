module.exports = async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const text = body.text;
    if (!text || text.length > 1500) return res.status(400).json({ error: "Write a payment instruction (under 1500 chars)." });
    const SYSTEM = `You turn a plain-English payment instruction into a split. Reply ONLY with JSON:
{"total_eth":number,"memo":"short label","recipients":[{"name":"","address":"0x... or null","fixed_eth":number|null,"weight":number}],"warnings":["..."]}
Rules: weight defaults to 1 ("gets double" = 2, "half" = 0.5). fixed_eth only if an exact amount is stated for that person. Never invent addresses; use null if none given. Add a warning for anything ambiguous, duplicated, or that cannot add up to total_eth.`;
    const r = await fetch("https://inference-api.openserv.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SERV_API_KEY}` },
      body: JSON.stringify({ model: process.env.SERV_MODEL || "gpt-5.4-mini",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: text }] }),
    });
    if (!r.ok) return res.status(502).json({ error: `SERV ${r.status}: ${(await r.text()).slice(0, 200)}` });
    const raw = (await r.json()).choices[0].message.content.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(raw));
  } catch (e) { res.status(500).json({ error: e.message }); }
};
module.exports = async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const text = body.text;
    if (!text || text.length > 1500) return res.status(400).json({ error: "Write a payment instruction (under 1500 chars)." });
    const key = (process.env.SERV_API_KEY || "").trim().replace(/^["']|["']$/g, "");
    const SYSTEM = `You turn a plain-English payment instruction into a split. Reply ONLY with JSON:
{"total_eth":number,"memo":"short label","recipients":[{"name":"","address":"0x... or null","fixed_eth":number|null,"weight":number}],"warnings":["..."]}
Rules: weight defaults to 1 ("gets double" = 2, "half" = 0.5). fixed_eth only if an exact amount is stated for that person. Never invent addresses; use null if none given. Add a warning for anything ambiguous, duplicated, or that cannot add up to total_eth.`;
    const r = await fetch("https://inference-api.openserv.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.SERV_MODEL || "gpt-5.4-mini",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: text }] }),
    });
    if (!r.ok) return res.status(502).json({ error: `SERV ${r.status} (key length ${key.length}, starts "${key.slice(0, 5)}"): ${(await r.text()).slice(0, 200)}` });
    const raw = (await r.json()).choices[0].message.content.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(raw));
  } catch (e) { res.status(500).json({ error: e.message }); }
};
