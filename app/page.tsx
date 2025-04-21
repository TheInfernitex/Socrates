"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
type ChatMessage = {
  role: "user" | "socrates";
  content: string;
  timestamp: string;
};
declare global {
  interface Window {
    puter: any;
  }
}
const formatTime = () => {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
export default function Home() {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
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
    People will share thoughts, problems, or beliefs with you. You are a sceptic. Ask them questions, and answer theirs, such they have never considered. Shatter their worldview.
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

    const chatHistory = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    try {
      const chat = await window.puter.ai.chat(chatHistory, {
        model: "gpt-4o-mini",
      });
      const socratesReply = String(chat.message.content);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage, timestamp: formatTime() },
        { role: "socrates", content: socratesReply, timestamp: formatTime() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage, timestamp: formatTime() },
        {
          role: "socrates",
          content: "Hmm... something went wrong. Try again later.",
          timestamp: formatTime(),
        },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    const updateHeight = () => {
      if (!messageContainerRef.current || !wrapperRef.current) return;

      const wrapper = wrapperRef.current;
      const form = wrapper.querySelector("form");
      const header = wrapper.querySelector(".text-center");

      const totalWrapperHeight = wrapper.clientHeight;
      const formHeight = form?.clientHeight || 0;
      const headerHeight = header?.clientHeight || 0;
      const spacing = 32;

      const availableHeight =
        totalWrapperHeight - formHeight - headerHeight - spacing - 50;

      messageContainerRef.current.style.height = `${availableHeight}px`;
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 text-white">
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />

      <div
        ref={wrapperRef}
        className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-[96%] p-6 flex flex-col space-y-4"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Socrates</h1>
          <p className="text-gray-300 mt-1">
            The digital philosopher is at your service. Get ready to question
            your worldview.
          </p>
        </div>

        <div
          ref={messageContainerRef}
          className="flex flex-col bg-gray-800 border border-gray-700 rounded-xl p-4 h-[70vh] overflow-y-auto space-y-4"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.role === "user"
                  ? "self-end items-end"
                  : "self-start items-start"
              }`}
            >
              <div
                className={`${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
                } p-3 rounded-xl max-w-[80%] text-sm shadow`}
              >
                {msg.role === "socrates" && <strong>Socrates: </strong>}
                {msg.content}
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />

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
