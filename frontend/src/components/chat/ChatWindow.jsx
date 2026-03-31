import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

export const ChatWindow = ({ messages, isLoading }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={scrollRef} 
      className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
    >
      <div className="flex flex-col pb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center mt-32 text-center text-muted-foreground opacity-60">
            <h2 className="text-2xl font-bold text-foreground mb-2">MindTrace AI</h2>
            <p>Your safe space for conversation and emotional tracking.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))
        )}
        
        {isLoading && (
          <div className="flex w-full mt-6 space-x-3 max-w-2xl mx-auto justify-start animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-background animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-muted text-foreground rounded-tl-sm text-sm">
              <span className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
