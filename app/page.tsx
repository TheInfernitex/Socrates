"use client";
import { FaUser, FaPaperPlane } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";

import { GiGreekTemple } from "react-icons/gi";
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
    <main className="min-h-screen bg-gradient-to-br from-[#2a2a72] via-[#2b2b60] to-[#2a2a70] flex items-center justify-center p-4 text-white font-sans">
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />

      <div
        ref={wrapperRef}
        className="w-full sm:max-w-[80%] p-6 rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10 flex flex-col space-y-6"
      >
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Socrates
          </h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base mx-auto">
            The digital philosopher is at your service. Prepare to question
            everything.
          </p>
        </div>

        <div
          ref={messageContainerRef}
          className="flex flex-col bg-blue-800/5 border border-white/10 rounded-xl p-4 h-[60vh] sm:h-[65vh] overflow-y-auto space-y-4 backdrop-blur-sm"
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
                    ? "bg-blue-600"
                    : "bg-white/10 border border-white/20"
                } text-white px-4 py-2 rounded-xl text-sm shadow-md transition-all`}
              >
                <div className="flex items-start gap-2">
                  {msg.role === "socrates" ? (
                    <GiGreekTemple className="text-yellow-400 mt-1 text-lg" />
                  ) : (
                    <FaUser className="text-blue-300 mt-1 text-base" />
                  )}
                  <span>{msg.content}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />

          {loading && (
            <div className="self-start bg-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm italic shadow-md border border-white/20 flex items-center gap-2">
              <FiLoader className="animate-spin" />
              Socrates is pondering...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            className="flex-grow px-4 py-2 rounded-full bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition backdrop-blur-sm"
            placeholder="Ask something deep..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !puterReady}
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-full text-white shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <FiLoader className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </form>
      </div>
    </main>
  );
}
