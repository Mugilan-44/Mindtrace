import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Menu, Activity, Calendar, Sparkles, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

console.log("🚀 API URL:", import.meta.env.VITE_API_URL);
const API_URL = import.meta.env.VITE_API_URL || 'https://mindtrace-72eh.onrender.com';

export const MentalWrapPage = () => {
  const [wrapData, setWrapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    fetch(`${API_URL}/api/analytics/wrap/weekly`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setWrapData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching wrap:", err);
        setIsLoading(false);
      });
  }, [user]);

  const getDominantGradient = (emotion) => {
    switch (emotion) {
      case 'joy': return 'from-yellow-400 to-orange-500';
      case 'sadness': return 'from-blue-600 to-indigo-800';
      case 'anger': return 'from-red-600 to-rose-900';
      case 'fear': return 'from-purple-700 to-violet-900';
      case 'surprise': return 'from-orange-400 to-pink-500';
      default: return 'from-gray-600 to-slate-800';
    }
  };

  const calculatePercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="flex flex-col flex-1 relative overflow-y-auto">
        <header className="h-14 flex items-center border-b border-border px-4 md:px-6 shrink-0 bg-background/80 backdrop-blur-sm z-10 sticky top-0">
          <button 
            className="md:hidden mr-4 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="font-semibold text-lg flex-1">MindTrace Wrapped</h1>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
              <Sparkles size={32} className="mb-4 text-primary" />
              <p>Analyzing your emotional footprint...</p>
            </div>
          ) : !wrapData || wrapData.messageCount === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed border-border rounded-xl">
              <Activity size={48} className="mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-foreground">Not Enough Data</h2>
              <p className="mt-2 max-w-md">You haven't chatted enough this week to generate a Mental Wrap. Keep interacting with MindTrace to unlock your insights!</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in pb-12">
              {/* Hero Card: Dominant Emotion */}
              <div className={cn(
                "rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative",
                "bg-gradient-to-br transition-all duration-1000",
                getDominantGradient(wrapData.dominantEmotion)
              )}>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-sm font-medium tracking-widest uppercase opacity-80 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> This Week's Vibe
                  </h2>
                  <h3 className="text-6xl md:text-8xl font-black tracking-tighter capitalize drop-shadow-lg mb-4">
                    {wrapData.dominantEmotion}
                  </h3>
                  <p className="text-lg md:text-xl font-medium opacity-90 max-w-lg leading-relaxed">
                    Based on your {wrapData.messageCount} messages, this was the primary emotion driving your conversations.
                  </p>
                </div>
              </div>

              {/* TIMELINE VISUALIZATION (RECHARTS) */}
              {wrapData.timeline && wrapData.timeline.length > 0 && (
                <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Activity className="text-primary" /> Emotional Timeline (Past 7 Days)
                  </h3>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={wrapData.timeline}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Line type="monotone" dataKey="joy" stroke="#eab308" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="sadness" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="anger" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="fear" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="neutral" stroke="#64748b" strokeWidth={3} dot={{r: 4}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AI Insight Card */}
                <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
                  <div className="flex flex-col mb-6">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                         <Sparkles size={20} className="text-primary" />
                       </div>
                       <h3 className="text-xl font-bold">MindTrace Insight</h3>
                    </div>
                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                      {wrapData.aiSummary}
                    </p>
                  </div>

                  {/* Personalized Suggestions */}
                  {wrapData.suggestions && wrapData.suggestions.length > 0 && (
                    <div className="mt-auto border-t border-border pt-6">
                      <h4 className="flex items-center gap-2 font-semibold mb-4 text-foreground">
                        <Lightbulb size={18} className="text-yellow-500" /> Actionable Suggestions
                      </h4>
                      <ul className="space-y-3">
                        {wrapData.suggestions.map((suggestion, i) => (
                           <li key={i} className="flex items-start gap-3 bg-muted/50 p-3 rounded-xl text-sm">
                             <div className="min-w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                             <span className="mt-0.5">{suggestion}</span>
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Emotional Trends Breakdown */}
                <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
                  <h3 className="text-xl font-bold mb-6">Emotional Breakdown</h3>
                  
                  <div className="flex flex-col gap-4 flex-1 justify-center">
                    {Object.entries(wrapData.emotionTrends)
                      .sort((a, b) => b[1] - a[1]) // highest first
                      .slice(0, 5) // top 5
                      .map(([emotion, count]) => {
                        const bgColors = {
                          joy: 'bg-yellow-500', sadness: 'bg-blue-500', anger: 'bg-red-500', 
                          fear: 'bg-purple-500', surprise: 'bg-orange-500', neutral: 'bg-gray-500'
                        };
                        const percentage = calculatePercentage(count, Object.values(wrapData.emotionTrends).reduce((a, b) => a + b, 0));
                        
                        return (
                          <div key={emotion} className="w-full">
                            <div className="flex justify-between text-sm mb-1 font-medium">
                              <span className="capitalize">{emotion}</span>
                              <span className="text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-1000 ease-out", bgColors[emotion] || 'bg-primary')}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
