
import React from "react";
import { Trophy } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-bold tracking-tight">
            The Lads Rivalry Week
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Built for the league, by the league.</p>
      </footer>
    </div>
  );
}
