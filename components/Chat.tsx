import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, AppUser } from '../types';
import { PaperAirplaneIcon } from './icons';
import {
  getOrCreateConversation,
  listenToConversationMessages,
} from '../services/firebaseService';
import TypingIndicator from './TypingIndicator';
import StreamingMessage from './StreamingMessage';
import { useCache } from '../contexts/CacheContext';

interface ChatProps {
  user: AppUser | null;
  discoveryId: string;
}

const ChatComponent: React.FC<ChatProps> = ({ user, discoveryId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConversationLoading, setIsConversationLoading] = useState(true);
  const [streamNextMessage, setStreamNextMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined); // Ref to store unsubscribe function
  const { getConversationId, cacheConversationId } = useCache();

  const isAiTyping = messages.length > 0 && messages[messages.length - 1].role === 'model' && messages[messages.length - 1].text === '...';

  // Effect to decide when to stream
  useEffect(() => {
    if (isAiTyping) {
      setStreamNextMessage(true);
    }
  }, [isAiTyping]);

  // Effect to get or create conversation and set up listener
  useEffect(() => {
    // If user logs out or discoveryId is missing, immediately unsubscribe and clear state
    if (!user?.uid || !discoveryId) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = undefined;
      }
      setIsConversationLoading(false);
      setMessages([]); // Clear messages on logout/discoveryId change
      setConversationId(null); // Clear conversation ID on logout/discoveryId change
      return;
    }

    const setupConversation = async () => {
      const cachedConversationId = getConversationId(discoveryId);
      let currentConversationId = cachedConversationId;

      if (!currentConversationId) {
        setIsConversationLoading(true); // Show loader if fetching conversation ID
        try {
          const conversation = await getOrCreateConversation(user.uid, discoveryId);
          currentConversationId = conversation.id || null;
          if (currentConversationId) {
            cacheConversationId(discoveryId, currentConversationId);
          }
        } catch (error) {
          console.error("Error setting up conversation:", error);
          setIsConversationLoading(false);
          return;
        }
      }
      
      if (currentConversationId) {
        setConversationId(currentConversationId);
        // Store the unsubscribe function in the ref
        unsubscribeRef.current = listenToConversationMessages(user.uid, currentConversationId, (fetchedMessages) => {
          setMessages(fetchedMessages);
          setIsConversationLoading(false); // Hide loader once messages arrive
        });
      } else {
        setIsConversationLoading(false);
      }
    };

    setIsConversationLoading(true); // Start loading state when user/discoveryId are valid
    setupConversation();

    // Cleanup function for the effect
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = undefined;
      }
    };
  }, [user?.uid, discoveryId, getConversationId, cacheConversationId]);

  // Effect to scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user?.uid || !conversationId) return;

    setStreamNextMessage(false);
    const userMessageText = input;
    setInput('');
    setIsLoading(true);

    try {
      // The backend API will handle adding the user message and AI placeholder to Firestore.
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          discoveryId: discoveryId,
          message: userMessageText,
        }),
      });

      if (response.status !== 202) {
        const errorBody = await response.json().catch(() => ({ error: 'An unknown chat error occurred' }));
        throw new Error(errorBody.error || `Request failed with status ${response.status}`);
      }

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConversationLoading) {
    return <div className="flex flex-col h-[60vh] bg-slate-800 p-4 items-center justify-center">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-[60vh] bg-slate-800 p-4">
      <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.length === 0 && !isAiTyping && (
          <div className="flex items-end gap-2 justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
              <p className="whitespace-pre-wrap">Hi! How can I help you with this discovery?</p>
            </div>
          </div>
        )}
        {messages.map((msg, index) => {
          if (msg.role === 'model' && msg.text === '...') {
            return null;
          }

          const isLastMessage = index === messages.length - 1;

          return (
            <div key={msg.key} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                {msg.role === 'model' && isLastMessage && streamNextMessage ? (
                  <StreamingMessage text={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          );
        })}
        {isAiTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-auto flex gap-2 border-t border-slate-700 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-grow bg-slate-700 border border-slate-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          disabled={isLoading || !conversationId}
        />
        <button type="submit" disabled={isLoading || !input.trim() || !conversationId} className="bg-cyan-500 text-white p-2.5 rounded-full disabled:bg-slate-600 hover:bg-cyan-600 transition-colors flex-shrink-0">
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
