import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trophy, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="text-center py-20">
      <Card className="bg-slate-800 border-slate-700 text-white max-w-md mx-auto">
        <CardContent className="p-8">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Welcome to Fantasy Rivalry Bets</h2>
          <p className="text-slate-400 mb-6">
            Place your bets on the weekly rivalry matchup and compete for prizes.
          </p>
          <Link to={createPageUrl("Home")}>
            <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
              Go to Current Rivalry
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}