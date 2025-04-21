"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
type ChatMessage = {
  role: "user" | "socrates";
  content: string;
};
export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);

  useEffect(() => {
    const checkPuter = setInterval(() => {
      if (typeof window !== "undefined" && window.puter) {
        setPuterReady(true);
        clearInterval(checkPuter);
      }
    }, 200);
    return () => clearInterval(checkPuter);
  }, []);

  const systemPrompt = `
    You are a digital Socrates. 
    People will share thoughts, problems, or beliefs with you. You are a sceptic. Ask them questions they have never considered. Shatter their worldview.
    Challenge them to reflect deeper. DO NOT provide a whole explaination or answer like an llm. Don't be deplomatic. Confront people's biases like Socrates used to. 
   Guide them towards critical thinking. Be casual. Chat with them. Be wise.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puterReady || !input.trim()) {
      console.log("puter not ready");
      return;
    }
    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const chat = await window.puter.ai.chat(systemPrompt + input, {
        model: "gpt-4o-mini",
      });
      const socratesReply = String(chat.message.content);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "socrates", content: socratesReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        {
          role: "socrates",
          content: "Hmm... something went wrong. Try again later.",
        },
      ]);
    }

    setLoading(false);
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 text-white">
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />

      <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-[96%] min-h-[90vh] p-6 flex flex-col space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Socrates</h1>
          <p className="text-gray-300 mt-1">
            The digital philosopher is at your service. Get ready to question
            your worldview.
          </p>
        </div>

        <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-xl p-4 h-[70vh] overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${
                msg.role === "user"
                  ? "self-end bg-blue-600 text-white"
                  : "self-start bg-gray-700 text-gray-100"
              } p-3 rounded-xl max-w-[80%] text-sm shadow`}
            >
              {msg.role === "socrates" && <strong>Socrates: </strong>}
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="self-start bg-gray-700 text-gray-400 p-3 rounded-xl max-w-[80%] text-sm italic shadow">
              Socrates is pondering...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow border border-gray-600 bg-gray-800 rounded-full pl-2 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            placeholder="Ask something deep..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !puterReady}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            {loading ? "..." : "→"}
          </button>
        </form>
      </div>
    </main>
  );
}
