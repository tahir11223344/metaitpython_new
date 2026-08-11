// src/lib/chatApi.js
/**
 * Chatbot streaming client.
 *
 * Backend Server-Sent Events bhejta hai. Native fetch use karte hain kyunke
 * axios browser me streaming response nahi deta — poora jawab aane ka intezar
 * karta hai, aur phir "typing" ka ehsaas khatam ho jata hai.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * @param messages      [{role: "user"|"assistant", content: string}]
 * @param sourcePage    kis page se chat hui — lead ke saath save hota hai
 * @param signal        AbortSignal — user "Stop" dabaye to stream rok dein
 * @param onDelta       (textChunk) => void   har token par
 * @param onLeadSaved   ({id, name, email}) => void  jab bot contact details save kare
 * @returns             poora jawab (string)
 */
export async function streamChat({
  messages,
  sourcePage = "",
  signal,
  onDelta,
  onLeadSaved,
}) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, source_page: sourcePage }),
    signal,
  });

  if (!res.ok) {
    let message = "The assistant is unavailable right now.";
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") message = body.detail;
    } catch {
      // JSON nahi mila — default message theek hai
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (!res.body) throw new Error("Streaming is not supported in this browser.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events "\n\n" par khatam hote hain. Aadha event buffer me chhor dete
    // hain — agli chunk ke saath mukammal ho jayega.
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const line = event.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;

      let payload;
      try {
        payload = JSON.parse(line.slice(6));
      } catch {
        continue;
      }

      if (payload.error) throw new Error(payload.error);
      if (payload.lead_saved) onLeadSaved?.(payload.lead_saved);
      if (payload.delta) {
        full += payload.delta;
        onDelta?.(payload.delta);
      }
      if (payload.done) return full;
    }
  }

  return full;
}
