const MODEL_NAME = "openai/gpt-oss-120b";

const MAX_MESSAGE_CHARS = 800;
const MAX_HISTORY_ITEMS = 10;

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "AI service is not configured."
    });
  }

  let body = req.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        error: "Invalid JSON."
      });
    }
  }

  const message =
    typeof body?.message === "string"
      ? body.message.trim()
      : "";

  if (message.length < 2 ||
      message.length > MAX_MESSAGE_CHARS) {
    return res.status(400).json({
      error: "Message must contain 2-800 characters."
    });
  }

  const context =
    body?.context &&
    typeof body.context === "object" &&
    !Array.isArray(body.context)
      ? body.context
      : {};

  const history = Array.isArray(body?.history)
    ? body.history
        .slice(-MAX_HISTORY_ITEMS)
        .filter(item =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string"
        )
        .map(item => ({
          role: item.role,
          content: item.content.slice(0, MAX_MESSAGE_CHARS)
        }))
    : [];

  const systemPrompt = `
You are Saathi AI, the official travel assistant
inside RouteSaathi.

Your expertise:
- Indian Railways
- Domestic flights
- Buses and private cabs
- Travel planning
- Transfer safety
- Seasonal delays

Instructions:
1. Use the provided RouteSaathi route context.
2. Give practical and concise answers.
3. Respond in the user's language.
4. Never invent live train availability or PNR status.
5. Recommend checking official booking platforms.

Current Route Context:
${JSON.stringify(context).slice(0, 2500)}
`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message }
          ],
          temperature: 0.6,
          max_completion_tokens: 512
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({
          error: "AI rate limit reached. Try again shortly."
        });
      }

      console.error("Groq API error:", response.status);

      return res.status(502).json({
        error: "AI service temporarily unavailable."
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "Empty response from AI."
      });
    }

    return res.status(200).json({
      reply,
      model: MODEL_NAME
    });

  } catch (error) {
    console.error("Chat backend error:", error.name);

    return res.status(
      error.name === "AbortError" ? 504 : 502
    ).json({
      error: "Unable to connect to AI. Please try again."
    });

  } finally {
    clearTimeout(timer);
  }
};