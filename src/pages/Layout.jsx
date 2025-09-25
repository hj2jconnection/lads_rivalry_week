
import React from "react";
import { Trophy } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <main>
        {children}
      </main>
    </div>
  );
}
