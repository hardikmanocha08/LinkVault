import { useEffect, useRef, useState } from "react";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

interface Card {
  _id: string;
  title: string;
  link: string;
  type: string;
  description?: string;
}

export function Chatbot({ contents }: { contents: Card[] }) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  async function fetchYouTubeDescription(link: string): Promise<string> {
    // Extract video ID from link
    const match = link.match(/[?&]v=([^&#]+)/);
    const videoId = match ? match[1] : null;
    if (!videoId) {
      console.error("YouTube: Could not extract video ID from link:", link);
      return "";
    }
    try {
      // Use noembed for more info
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (!res.ok) {
        console.error(`YouTube: noembed.com returned ${res.status} for video ID: ${videoId}`);
        return "";
      }
      const data = await res.json();
      // Prefer description, fallback to title
      return data.description ? data.description : (data.title ? `Title: ${data.title}` : "");
    } catch (error) {
      console.error("YouTube: Error fetching description for video ID:", videoId, error);
      return "";
    }
  }

  async function fetchTweetText(link: string): Promise<string> {
    // Try to extract tweet ID from link
    const match = link.match(/twitter.com\/(?:#!\/)?\w+\/status\/(\d+)/);
    const tweetId = match ? match[1] : null;
    if (!tweetId) {
      console.error("Twitter: Could not extract tweet ID from link:", link);
      return "";
    }
    try {
      // Use Twitter oEmbed for public tweets
      const res = await fetch(`https://publish.twitter.com/oembed?url=https://twitter.com/user/status/${tweetId}`);
      if (!res.ok) {
        console.error(`Twitter: oEmbed returned ${res.status} for tweet ID: ${tweetId}`);
        return "";
      }
      const data = await res.json();
      // Extract text from HTML robustly
      const html = data.html || "";
      // Remove all HTML tags
      const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      return text || "";
    } catch (error) {
      console.error("Twitter: Error fetching tweet text for tweet ID:", tweetId, error);
      return "";
    }
  }

  async function enrichCards(cards: Card[]): Promise<Card[]> {
    return Promise.all(cards.map(async card => {
      let currentCard = { ...card };

      if (currentCard.type === "youtube" && !currentCard.description) {
        const desc = await fetchYouTubeDescription(currentCard.link);
        if (desc) { // Only update if a description was actually fetched
          currentCard = { ...currentCard, description: desc };
        }
      } else if (currentCard.type === "twitter" && !currentCard.description) {
        const desc = await fetchTweetText(currentCard.link);
        if (desc) { // Only update if a description was actually fetched
          currentCard = { ...currentCard, description: desc };
        }
      }

      // Fallback: if description is still missing, use the title
      if (!currentCard.description && currentCard.title) {
        currentCard = { ...currentCard, description: `Title: ${currentCard.title}` };
      }
      
      return currentCard;
    }));
  }

  async function getGeminiResponse(question: string) {
    setLoading(true);
    try {
      const enriched = await enrichCards(contents);
        // Build a clean, human-readable numbered list for the model to reference.
        const cardsText = (enriched || []).map((c, idx) => {
          const num = idx + 1;
          const id = c._id ?? "N/A";
          const title = c.title ?? "(no title)";
          let description = c.description ? c.description.replace(/\s+/g, " ").trim() : "";
          
          // If description is still empty after enrichment, use title as fallback
          if (!description && title !== "(no title)") {
            description = `Title: ${title}`;
          } else if (!description) {
            // If both description and title are empty, explicitly state no description
            description = "(no description)";
          }

          const link = c.link ?? "(no link)";
          return `${num}. CardNumber: ${num} | ID: ${id} | Title: ${title} | Description: ${description} | Link: ${link}`;
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
    setMessages(msgs => [...msgs, { sender: "user", text: input }]);
    setInput(""); // Clear input immediately

    let response = "";
    if (!apiKey) {
      response = "Please provide your Gemini API key in the .env file (VITE_GEMINI_API_KEY).";
    } else {
      response = await getGeminiResponse(input);
    }
    setMessages(msgs => [...msgs, { sender: "bot", text: response }]);
  }
  return minimized ? (
    <div className="fixed bottom-4 right-4 w-12 h-12 sm:w-16 sm:h-16 bg-indigo-500 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-50" onClick={() => setMinimized(false)}>
      <span className="text-white font-bold text-lg sm:text-xl">💬</span>
    </div>
  ) : (
    <div ref={chatbotRef} className="fixed bottom-4 right-4 w-64 sm:w-96 bg-white/90 rounded-xl shadow-lg border p-2 sm:p-4 z-50">
      <div className="font-bold mb-2 text-sm sm:text-base">Chatbot (Powered by Gemini API)</div>
      {!apiKey && (
        <div className="text-red-500 text-xs sm:text-sm mb-2 p-1 bg-red-100 rounded">
          API Key missing! Please set VITE_GEMINI_API_KEY in your .env file.
        </div>
      )}
      <div className="h-32 sm:h-48 overflow-y-auto mb-2 bg-gray-50 rounded p-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender === "user" ? "text-right" : "text-left text-indigo-700"}>
            <span className="block mb-1 text-xs sm:text-sm"><b>{msg.sender === "user" ? "You" : "Bot"}:</b> {msg.text}</span>
          </div>
        ))}
        {loading && (
          <div className="flex justify-center items-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
            <span className="ml-2 text-xs sm:text-sm text-gray-400">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-xs sm:text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your interest, card details, or recommendations..."
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          disabled={loading || !apiKey}
        />
        <button className="bg-indigo-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm" onClick={handleSend} disabled={loading || !apiKey}>Send</button>
      </div>
    </div>
  );
}
