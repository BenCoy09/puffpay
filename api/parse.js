module.exports = async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const text = body.text;
    if (!text || text.length > 1500) return res.status(400).json({ error: "Write a payment instruction (under 1500 chars)." });
    const key = (process.env.SERV_API_KEY || "").trim().replace(/^["']|["']$/g, "");
    const SYSTEM = `You turn a plain-English payment instruction into a split. Reply with ONLY one JSON object, no other text, using exactly these keys:
{"total_eth":0.001,"memo":"Payment to Ada and Tobi","recipients":[{"name":"Ada","address":"0x...or null","fixed_eth":null,"weight":2},{"name":"Tobi","address":"0x...or null","fixed_eth":null,"weight":1}],"warnings":[]}
Rules: total_eth is a number in ETH. weight defaults to 1 ("gets double" = 2, "half" = 0.5). fixed_eth only if an exact amount is stated for that person, otherwise null. Copy addresses exactly as written; use null if none given. Add a warning for anything ambiguous or duplicated.`;
    const r = await fetch("https://inference-api.openserv.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.SERV_MODEL || "gpt-5.4-mini",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: text }] }),
    });
    if (!r.ok) return res.status(502).json({ error: `SERV ${r.status}: ${(await r.text()).slice(0, 200)}` });
    const raw = (await r.json()).choices[0].message.content || "";
    const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
    const j = JSON.parse(raw.slice(start, end + 1));
    const list = j.recipients || j.payees || j.people || j.splits || [];
    const out = {
      total_eth: Number(j.total_eth ?? j.total ?? j.total_amount ?? j.amount),
      memo: j.memo || "Split",
      recipients: list.map(x => ({
        name: x.name || x.recipient || "",
        address: x.address || x.wallet || null,
        fixed_eth: x.fixed_eth ?? null,
        weight: Number(x.weight ?? x.share ?? 1) || 1,
      })),
      warnings: j.warnings || [],
    };
    if (!out.recipients.length || !(out.total_eth > 0)) return res.status(200).json({ error: "SERV replied in an unexpected format: " + raw.slice(0, 300) });
    res.status(200).json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
