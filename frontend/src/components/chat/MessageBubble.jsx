import React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // A helper function to color-code emotions
  const getEmotionColor = (emotion) => {
    switch(emotion) {
      case 'joy': return 'bg-yellow-500/20 text-yellow-500';
      case 'sadness': return 'bg-blue-500/20 text-blue-500';
      case 'anger': return 'bg-red-500/20 text-red-500';
      case 'fear': return 'bg-purple-500/20 text-purple-500';
      case 'surprise': return 'bg-orange-500/20 text-orange-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className={cn("flex w-full mt-4 space-x-3 max-w-2xl mx-auto", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot size={18} className="text-primary-foreground" />
        </div>
      )}
      
      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed", 
          isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"
        )}>
          {message.content}
        </div>
        
        {/* Only show emotion tag if it exists and is meaningful. Often we just tag user messages for tracking */}
        {isUser && message.emotion && (
          <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1", getEmotionColor(message.emotion))}>
            {message.emotion}
          </span>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
          <User size={18} className="text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
