"use client";

import { useEffect, useState, useCallback } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, Loader2 } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";

import { CONFIG } from "@/lib/config";

interface HistoryItem { // Renamed from AudioGeneration
  id: string;
  prompt: string;
  voiceId: string;
  audioData: string;
  createdAt: string;
}

export function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // ID of item being deleted
  const [isClearing, setIsClearing] = useState(false);
  const userId = useUserSession();

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch(CONFIG.API.HISTORY, {
        headers: { "X-User-Id": userId }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        // Optimistic update: Prepend new item without fetching
        setHistory(prev => [customEvent.detail, ...prev]);
      } else {
        // Fallback: Fetch from API
        fetchHistory();
      }
    };
    
    window.addEventListener('refreshHistory', handleRefresh);
    return () => window.removeEventListener('refreshHistory', handleRefresh);
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!userId) return;
    setIsDeleting(id);
    try {
      const response = await fetch(`${CONFIG.API.HISTORY}/${id}`, {
        method: 'DELETE',
        headers: { "X-User-Id": userId }
      });
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all history?")) return;
    if (!userId) return;
    setIsClearing(true);
    try {
      const response = await fetch(CONFIG.API.HISTORY, {
        method: 'DELETE',
        headers: { "X-User-Id": userId }
      });
      
      if (response.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to clear history:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="h-full border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <History className="h-5 w-5 text-indigo-400" />
          Generation History
        </CardTitle>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={isClearing}
            className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10 cursor-pointer"
            aria-label="Clear History"
          >
            {isClearing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-[calc(100vh-300px)] px-6 pb-6">
          {isLoading && !isDeleting ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No generations yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 space-y-3 group relative animate-in fade-in slide-in-from-top-4 duration-500"
                >
                  <div className="pr-8 space-y-1">
                    <p className="text-sm text-zinc-300 line-clamp-2 font-medium">
                      &quot;{item.prompt}&quot;
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting === item.id}
                    className="absolute top-2 right-2 h-6 w-6 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Delete"
                  >
                    {isDeleting === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>

                  <AudioPlayer
                    audioUrl={`data:audio/mpeg;base64,${item.audioData}`}
                    prompt={item.prompt}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
