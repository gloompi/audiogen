"use client";

import { useState } from "react";
import { GeneratorForm } from "@/components/GeneratorForm";
import { HistoryList } from "@/components/HistoryList";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        <header className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
            AI Audio Generator
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Transform text into lifelike speech using advanced AI. 
            Powered by ElevenLabs and Next.js.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-8">
            <GeneratorForm onSuccess={handleSuccess} />
            
            <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50 text-sm text-zinc-500">
              <h3 className="font-semibold text-zinc-300 mb-2">How it works</h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>Select a voice persona</li>
                <li>Enter your text prompt</li>
                <li>Click generate to create audio</li>
                <li>Listen and download your clip</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <HistoryList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </main>
  );
}
