"use client";

import { useEffect, useState } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Loader2, Trash2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AudioGeneration {
  id: string;
  prompt: string;
  voiceId: string;
  audioData: string;
  createdAt: string;
}

interface HistoryListProps {
  refreshTrigger: number;
}

export function HistoryList({ refreshTrigger }: HistoryListProps) {
  const [history, setHistory] = useState<AudioGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete item", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all history?")) return;
    setIsDeleting("all");
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to clear history", error);
    } finally {
      setIsDeleting(null);
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
            disabled={!!isDeleting}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8 px-2 text-xs"
            aria-label="Clear History"
          >
            <XCircle className="mr-1 h-3 w-3" />
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
                  className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 space-y-3 group relative"
                >
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm text-zinc-300 line-clamp-2 font-medium pr-8">
                      &quot;{item.prompt}&quot;
                    </p>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting === item.id}
                    className="absolute top-2 right-2 h-6 w-6 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete"
                  >
                    {isDeleting === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>

                  <AudioPlayer audioUrl={item.audioData} />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
