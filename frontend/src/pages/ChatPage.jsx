import React, { useState, useEffect } from 'react';
import { Send, Menu } from 'lucide-react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';

console.log("🚀 API URL:", import.meta.env.VITE_API_URL);
const API_URL = import.meta.env.VITE_API_URL || 'https://mindtrace-72eh.onrender.com';

export const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get user for token
  const { user } = useAuth();

  // Load history on mount
  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/api/chat/history`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(err => console.error("Error loading history:", err));
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Optimistic UI update
    const tempUserMsg = { sender: 'user', content: userText };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ text: userText })
      });

      const data = await response.json();
      
      // Update with confirmed data (including emotion)
      setMessages(prev => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, data.userMessage, data.botResponse];
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 relative">
        <header className="h-14 flex items-center border-b border-border px-4 md:px-6 shrink-0 bg-background/80 backdrop-blur-sm z-10">
          <button className="md:hidden mr-4 text-muted-foreground hover:text-foreground">
            <Menu size={24} />
          </button>
          <h1 className="font-semibold text-lg flex-1 text-center md:text-left">Chat</h1>
        </header>

        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* Input Area */}
        <div className="p-4 bg-background">
          <div className="max-w-3xl mx-auto relative flex items-end w-full border border-border bg-card rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow box-shadow-sm">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="How are you feeling today?"
              className="flex-1 max-h-32 min-h-[56px] py-4 px-4 bg-transparent resize-none outline-none border-none text-sm placeholder:text-muted-foreground"
              rows={1}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="shrink-0 p-2 mb-2 mr-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-3">
             MindTrace AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
};
