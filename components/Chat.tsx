import React, { useState, useEffect, useRef } from 'react';
import type { LandmarkInfo, ChatMessage } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { PaperAirplaneIcon } from './icons';

interface ChatProps {
  landmarkInfo: LandmarkInfo;
}

const ChatComponent: React.FC<ChatProps> = ({ landmarkInfo }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageKey = useRef(1); // Use a ref for the key counter

  useEffect(() => {
    setMessages([
      { role: 'model', text: `Hi! What would you like to know about ${landmarkInfo.name}?`, key: 0 }
    ]);
    nextMessageKey.current = 1; // Reset counter when landmarkInfo changes
  }, [landmarkInfo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageKey = nextMessageKey.current++;
    const newUserMessage: ChatMessage = { role: 'user', text: input, key: userMessageKey };

    // Optimistically add user message to display
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
        // Create history for API call including the new user message
        const historyForApi = [...messages, newUserMessage].map(({ role, text }) => ({ role, text }));

        const modelMessageKey = nextMessageKey.current++; // Get key for model's placeholder
        // Add a placeholder for the model's response
        setMessages(prev => [...prev, { role: 'model', text: '', key: modelMessageKey }]);

        let modelResponse = '';
        await streamChatResponse(historyForApi, input, landmarkInfo, async (chunk) => {
            for (const char of chunk) {
                modelResponse += char;
                setMessages(prev => prev.map(msg =>
                    msg.key === modelMessageKey ? { ...msg, text: modelResponse } : msg
                ));
                await new Promise(resolve => setTimeout(resolve, 10)); // Adjust delay for desired speed
            }
        });

    } catch (error) {
      console.error("Chat error:", error);
      // Find the model's placeholder message and replace it with an error message
      setMessages(prev => prev.map(m =>
        m.key === (nextMessageKey.current - 1) && m.role === 'model' && m.text === ''
          ? { ...m, text: "Sorry, I couldn't process that. Please try again." }
          : m
      ));
      // Decrement the key counter if the model message failed to avoid gaps/reuse
      nextMessageKey.current--;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] bg-slate-800 p-4">
      <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.map((msg) => (
          <div key={msg.key} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text || <span className="inline-block w-2 h-4 bg-slate-300 animate-pulse rounded-sm"></span>}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-auto flex gap-2 border-t border-slate-700 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-grow bg-slate-700 border border-slate-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="bg-cyan-500 text-white p-2.5 rounded-full disabled:bg-slate-600 hover:bg-cyan-600 transition-colors flex-shrink-0">
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
