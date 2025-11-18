import { useEffect, useRef, useState } from "react";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

interface Card {
  _id: string;
  title: string;
  link: string;
  type: string;
  description?: string;
}

export function Chatbot({ contents }: { contents: any[] }) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const chatbotRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
  if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
  setMinimized(true);
  }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
  document.removeEventListener("mousedown", handleClickOutside);
  };
  }, []);
  async function fetchYouTubeDescription(link: string): Promise<string> {
    // Extract video ID from link
    const match = link.match(/[?&]v=([^&#]+)/);
    const videoId = match ? match[1] : null;
    if (!videoId) return "";
    try {
      // Use noembed for more info
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (!res.ok) return "";
      const data = await res.json();
      // Prefer description, fallback to title
      return data.description ? data.description : (data.title ? `Title: ${data.title}` : "");
    } catch {
      return "";
    }
  }

  async function fetchTweetText(link: string): Promise<string> {
    // Try to extract tweet ID from link
    const match = link.match(/twitter.com\/(?:#!\/)?\w+\/status\/(\d+)/);
    const tweetId = match ? match[1] : null;
    if (!tweetId) return "";
    try {
      // Use Twitter oEmbed for public tweets
      const res = await fetch(`https://publish.twitter.com/oembed?url=https://twitter.com/user/status/${tweetId}`);
      if (!res.ok) return "";
      const data = await res.json();
      // Extract text from HTML robustly
      const html = data.html || "";
      // Remove all HTML tags
      const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      return text || "";
    } catch {
      return "";
    }
  }

  async function enrichCards(cards: Card[]): Promise<Card[]> {
    // For each card, fetch description if missing
    return Promise.all(cards.map(async card => {
      if (card.type === "youtube" && !card.description) {
        const desc = await fetchYouTubeDescription(card.link);
        return { ...card, description: desc };
      }
      if (card.type === "twitter" && !card.description) {
        const desc = await fetchTweetText(card.link);
        return { ...card, description: desc };
      }
      return card;
    }));
  }

  async function getGeminiResponse(question: string) {
    setLoading(true);
    try {
      const enriched = await enrichCards(contents);
        // Build a clean, human-readable numbered list for the model to reference.
        const cardsText = (enriched || []).map((c, idx) => {
          const num = idx + 1;
          const id = (c as Card)._id ?? "N/A";
          const title = (c as Card).title ?? "(no title)";
          const desc = (c as Card).description ? ((c as Card).description as string).replace(/\s+/g, " ").trim() : "(no description)";
          const link = (c as Card).link ?? "(no link)";
          return `${num}. CardNumber: ${num} | ID: ${id} | Title: ${title} | Description: ${desc} | Link: ${link}`;
        }).join("\n");

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                    text: `System: You are LinkVault's assistant. Do not disclose any private credentials or backend-only tokens. When answering, use ONLY the card data provided below. Provide concise, factual answers referencing card numbers when appropriate. For each card include: CardNumber, Title, Description, and the Link. If the user asks about a specific card, refer to it by its CardNumber. Do NOT invent additional cards or data.\n\nMy cards:\n${cardsText}\n\nUser: ${question}`
                }
              ]
            }
          ]
        })
      });
      const data = await response.json();
      setLoading(false);
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
      return "No response from Gemini API.";
    } catch {
      setLoading(false);
      return "Error contacting Gemini API.";
    }
  }
  async function handleSend() {
  if (!input.trim()) return;
  setMessages([...messages, { sender: "user", text: input }]);
  let response = "";
  if (!apiKey) {
  response = "Please enter your Gemini API key.";
  } else {
  response = await getGeminiResponse(input);
  }
  setMessages(msgs => [...msgs, { sender: "bot", text: response }]);
  setInput("");
  }
  return minimized ? (
    <div className="fixed bottom-4 right-4 w-12 h-12 sm:w-16 sm:h-16 bg-indigo-500 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-50" onClick={() => setMinimized(false)}>
      <span className="text-white font-bold text-lg sm:text-xl">💬</span>
    </div>
  ) : (
    <div ref={chatbotRef} className="fixed bottom-4 right-4 w-64 sm:w-96 bg-white/90 rounded-xl shadow-lg border p-2 sm:p-4 z-50">
      <div className="font-bold mb-2 text-sm sm:text-base">Chatbot (Powered by Gemini API)</div>
      <div className="mb-2"></div>
      <div className="h-32 sm:h-48 overflow-y-auto mb-2 bg-gray-50 rounded p-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender === "user" ? "text-right" : "text-left text-indigo-700"}>
            <span className="block mb-1 text-xs sm:text-sm"><b>{msg.sender === "user" ? "You" : "Bot"}:</b> {msg.text}</span>
          </div>
        ))}
        {loading && <div className="text-center text-gray-400">Thinking...</div>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-xs sm:text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your interest, card details, or recommendations..."
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
        />
        <button className="bg-indigo-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm" onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
}


