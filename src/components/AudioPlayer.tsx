"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
}

export function AudioPlayer({ audioUrl, className }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#4f46e5", // Indigo 600
      progressColor: "#818cf8", // Indigo 400
      cursorColor: "#c7d2fe", // Indigo 200
      barWidth: 2,
      barGap: 3,
      height: 60,
      barRadius: 3,
    });

    wavesurfer.current.load(audioUrl).catch((err) => {
      // Ignore abort errors which happen on cleanup
      if (err.name === 'AbortError' || err.message?.includes('aborted')) return;
      console.error("Error loading audio:", err);
    });

    wavesurfer.current.on("ready", () => {
      setIsReady(true);
    });

    wavesurfer.current.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      try {
        wavesurfer.current?.destroy();
      } catch (e) {
        // Ignore abort errors during cleanup
        console.warn("Wavesurfer cleanup error:", e);
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "generated-audio.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800", className)}>
      <Button
        size="icon"
        variant="ghost"
        className="h-10 w-10 rounded-full bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300"
        onClick={togglePlay}
        disabled={!isReady}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>

      <div className="flex-1" ref={containerRef} />

      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-zinc-400 hover:text-white"
        onClick={downloadAudio}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
