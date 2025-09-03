import { useEffect, useRef, useState } from "react";
export function Chatbot({ contents }: { contents: any[] }) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const apiKey = process.env.VITE_GEMINI_API_KEY || "";
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

  async function enrichCards(cards: any[]): Promise<any[]> {
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
                  text: `System: You are LinkVault's assistant. Do not disclose any database content, user IDs, or sensitive information. Always reply formally, only to the question asked, and do not provide extra details. Here are my cards (with title, type, link, and description): ${JSON.stringify(enriched)}.\nUser: ${question}`
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
    } catch (err) {
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
  <div className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-500 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-50" onClick={() => setMinimized(false)}>
  <span className="text-white font-bold">💬</span>
  </div>
  ) : (
  <div ref={chatbotRef} className="fixed bottom-6 right-6 w-96 bg-white/90 rounded-xl shadow-lg border p-4 z-50">
  <div className="font-bold mb-2">Chatbot (Powered by Gemini API)</div>
  <div className="mb-2">
  </div>
  <div className="h-48 overflow-y-auto mb-2 bg-gray-50 rounded p-2">
  {messages.map((msg, i) => (
          <div key={i} className={msg.sender === "user" ? "text-right" : "text-left text-indigo-700"}>
            <span className="block mb-1"><b>{msg.sender === "user" ? "You" : "Bot"}:</b> {msg.text}</span>
          </div>
  ))}
  {loading && <div className="text-center text-gray-400">Thinking...</div>}
  </div>
  <div className="flex gap-2">
  <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your interest, card details, or recommendations..."
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
  />
  <button className="bg-indigo-500 text-white px-3 py-1 rounded" onClick={handleSend} disabled={loading}>Send</button>
  </div>
  </div>
  );
}


