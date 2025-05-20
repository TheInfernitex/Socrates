"use client";
import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import { FaUser, FaPaperPlane, FaScroll } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { GiGreekTemple, GiOlive } from "react-icons/gi";
import { PiLightningFill } from "react-icons/pi";

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

// Philosophical quotes by Socrates for the welcome screen
const socratesQuotes = [
  "The unexamined life is not worth living.",
  "I know that I know nothing.",
  "The only true wisdom is in knowing you know nothing.",
  "Wonder is the beginning of wisdom.",
  "Be kind, for everyone you meet is fighting a hard battle.",
  "To find yourself, think for yourself.",
];

export default function Home() {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [randomQuote, setRandomQuote] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Set a random Socrates quote on initial load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * socratesQuotes.length);
    setRandomQuote(socratesQuotes[randomIndex]);
  }, []);

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
    People will share thoughts, problems, or beliefs with you. You are a skeptic. Ask them questions, and answer theirs, such they have never considered. 
    Challenge them to reflect deeper. DO NOT provide a whole explanation or answer like an LLM. Act like the real Socrates of greek is said to have been. Confront people's biases like Socrates used to. 
    Guide them towards critical thinking. Be casual. Chat with them. Don't be too aggressive with the questions through.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puterReady || !input.trim()) {
      return;
    }

    // Hide welcome screen if visible
    if (showWelcome) {
      setShowWelcome(false);
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
          content:
            "Hmm... it seems my thoughts have been scattered by the winds of Athens. Perhaps we should try again later.",
          timestamp: formatTime(),
        },
      ]);
    }

    setLoading(false);
    inputRef.current?.focus();
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

  const startConversation = () => {
    setShowWelcome(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1a50] via-[#2a305e] to-[#3a4068] flex items-center justify-center p-4 text-white font-sans">
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/3 right-10 text-white/5 text-6xl">
          <GiOlive />
        </div>
        <div className="absolute bottom-1/3 left-10 text-white/5 text-6xl rotate-45">
          <GiOlive />
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="w-full sm:max-w-[80%] md:max-w-[70%] lg:max-w-[900px] p-6 rounded-3xl bg-white/5 backdrop-blur-md shadow-2xl border border-white/10 flex flex-col space-y-6 relative z-10"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <GiGreekTemple className="text-yellow-300 text-3xl mb-1" />
            <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
              Socrates
            </h1>
          </div>
          <p className="text-gray-300 mt-2 text-sm sm:text-base mx-auto max-w-lg">
            The digital philosopher is ready to engage with your mind. Prepare
            to question everything you believe.
          </p>
        </div>

        <AnimatePresence>
          {showWelcome ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-[60vh] text-center px-6"
            >
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 max-w-xl shadow-lg">
                <GiGreekTemple className="text-yellow-300 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">
                  Welcome to the Agora
                </h2>
                <p className="text-gray-200 italic mb-6">"{randomQuote}"</p>
                <p className="mb-6">
                  I am Socrates, reborn in digital form. I exist not to provide
                  answers, but to question, challenge, and help you discover
                  wisdom through reflection.
                </p>
                <button
                  onClick={startConversation}
                  className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-full text-white shadow-lg flex items-center justify-center gap-2 mx-auto"
                >
                  <FaScroll className="text-white" />
                  Begin Philosophical Dialogue
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              ref={messageContainerRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col bg-blue-900/10 border border-white/10 rounded-xl p-4 h-[60vh] sm:h-[65vh] overflow-y-auto space-y-4 backdrop-blur-sm"
            >
              {messages.length === 0 && (
                <div className="text-center text-gray-400 italic my-auto">
                  Share your thoughts or ask a question to begin your dialogue
                  with Socrates...
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`flex flex-col ${
                    msg.role === "user"
                      ? "self-end items-end"
                      : "self-start items-start"
                  }`}
                >
                  <div
                    className={`${
                      msg.role === "user"
                        ? "bg-blue-600/90"
                        : "bg-white/10 border border-white/20"
                    } text-white px-4 py-3 rounded-xl text-sm shadow-md transition-all max-w-[80%]`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.role === "socrates" ? (
                        <GiGreekTemple className="text-yellow-300 mt-1 text-lg flex-shrink-0" />
                      ) : (
                        <FaUser className="text-blue-300 mt-1 text-base flex-shrink-0" />
                      )}
                      <span className="leading-relaxed">{msg.content}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 mr-1">
                    {msg.timestamp}
                  </span>
                </motion.div>
              ))}

              <div ref={messagesEndRef} />

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="self-start bg-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm italic shadow-md border border-white/20 flex items-center gap-2"
                >
                  <FiLoader className="animate-spin" />
                  Socrates is contemplating...
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            className="flex-grow px-4 py-3 rounded-full bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition backdrop-blur-sm"
            placeholder={
              showWelcome
                ? "Begin your dialogue with Socrates..."
                : "What thoughts trouble your mind today?"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !puterReady}
          />
          <button
            type="submit"
            disabled={loading || !puterReady}
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-3 rounded-full text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <FiLoader className="animate-spin" />
            ) : (
              <>
                <FaPaperPlane /> <PiLightningFill className="text-yellow-300" />
              </>
            )}
          </button>
        </form>

        <div className="text-xs text-center text-gray-500 opacity-70 absolute bottom-0 left-0 right-0 -mb-6">
          Experience the wisdom of ancient Greece through modern AI
        </div>
      </div>
    </main>
  );
}
