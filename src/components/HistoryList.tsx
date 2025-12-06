"use client";

import { useEffect, useState } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Loader2 } from "lucide-react";
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

  useEffect(() => {
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

    fetchHistory();
  }, [refreshTrigger]);

  return (
    <Card className="h-full border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <History className="h-5 w-5 text-indigo-400" />
          Generation History
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-[calc(100vh-300px)] px-6 pb-6">
          {isLoading ? (
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
                  className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 space-y-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm text-zinc-300 line-clamp-2 font-medium">
                      "{item.prompt}"
                    </p>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
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
