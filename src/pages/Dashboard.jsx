import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trophy, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-black border-2 border-white rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-2xl">
          <div className="text-4xl">🍔</div>
        </div>
        <h1 className="text-6xl font-bold text-white text-center mb-2">
          Get Muck<span className="text-4xl">'</span><span className="text-5xl">d</span>
        </h1>
        <p className="text-white text-xl text-center">
          Too many mothermuckers mucking with my shit
        </p>
      </div>

      {/* Main Button */}
      <div className="mb-8">
        <Link to={createPageUrl("Home")}>
          <Button 
            size="lg" 
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3"
          >
            Pick your Mucker
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}