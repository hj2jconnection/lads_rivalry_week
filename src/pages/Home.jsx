
import React, { useState, useEffect, useMemo } from "react";
import { RivalryWeek, Bet, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { DollarSign, Users, Target, CheckCircle, Trophy, Lock, User as UserIcon, LogIn, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AdminPanel from "../components/AdminPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const getInitials = (name) => {
  if (!name) return "?";
  const names = name.trim().split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// A simple component to get the user's name
const NameInputForm = ({ onNameSubmit }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <Card className="bg-blue-900/50 border-blue-700 text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <LogIn className="h-5 w-5" />
          Enter Your Name to Bet
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Label htmlFor="user-name" className="sr-only">Your Name</Label>
          <Input
            id="user-name"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-900 border-slate-600 text-white text-center text-lg"
            required
          />
          <Button type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-500">
            Join the Rivalry
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </form>
    </Card>
  );
};

export default function HomePage() {
  const [rivalry, setRivalry] = useState(null);
  const [bets, setBets] = useState([]);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [marginValue, setMarginValue] = useState([0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for a stored name first
    const storedName = localStorage.getItem("rivalryBetUserName");
    if (storedName) {
      setUserName(storedName);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Check for admin status separately, without blocking the app
      try {
        const user = await User.me();
        if (user && user.email === 'hayden@j2j.info') {
          setIsAdmin(true);
        }
      } catch (e) {
        // This is expected for non-logged-in users, so we can ignore it.
        console.log("No authenticated user, admin features disabled");
        setIsAdmin(false);
      }

      const [rivalries, allBets] = await Promise.all([
        RivalryWeek.list('-created_date', 1),
        Bet.list(),
      ]);

      const currentRivalry = rivalries[0];
      setRivalry(currentRivalry);

      if (currentRivalry) {
        setBets(allBets.filter(b => b.rivalry_week_id === currentRivalry.id));
      } else {
        setBets([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Could not load rivalry data. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNameSubmit = (name) => {
    localStorage.setItem("rivalryBetUserName", name);
    setUserName(name);
  };

  const placeBet = async (bet_type, pick) => {
    if (!userName) {
      setError("Please enter your name first.");
      return;
    }
    if (currentUserBets.length > 0) {
      setError("You have already placed your bet for this week.");
      return;
    }
    if (!rivalry || !pick || bettingClosed) {
      setError("Cannot place bet at this time.");
      return;
    }
    try {
      await Bet.create({
        rivalry_week_id: rivalry.id,
        user_name: userName,
        bet_type,
        pick: String(pick),
        amount: 5
      });
      fetchData();
      setMarginValue([0]);
      setError("");
    } catch (err) {
      console.error("Error placing bet:", err);
      setError("There was a problem placing your bet. Please try again.");
    }
  };

  const handleMarginBet = () => {
    if (marginValue[0] === 0) {
      setError("You must select a margin greater than 0 for either team.");
      return;
    }
    setError("");
    placeBet('margin', String(marginValue[0]));
  };
  
  const parseMarginBet = (pick) => {
    const points = parseInt(pick, 10);
    if (points < 0) return { team: 'team_a', points: Math.abs(points) };
    if (points > 0) return { team: 'team_b', points: points };
    return { team: null, points: 0 };
  };

  const currentUserBets = useMemo(() => {
    if (!userName) return [];
    return bets.filter(b => b.user_name === userName);
  }, [bets, userName]);

  const totalPot = bets.length * 5;
  const bettingClosed = rivalry?.status === 'completed';

  if (isLoading) {
    return <Skeleton className="w-full h-96 bg-slate-800" />;
  }

  if (!rivalry) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-3xl font-bold">🍔</span>
          </div>
          <h1 className="text-6xl font-bold text-white text-center mb-2">
            Muck <span className="text-4xl">'</span><span className="text-5xl">d</span>
          </h1>
          <p className="text-purple-400 text-xl text-center">
            Turning Playtime into Paytime
          </p>
        </div>

        {/* No Rivalry Message */}
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 mx-auto text-slate-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Rivalry Week Active</h2>
          <p className="text-slate-400">The commissioner hasn't set up the next rivalry matchup yet.</p>
        </div>

        {isAdmin && <AdminPanel fetchData={fetchData} />}
      </div>
    );
  }

  const MarginSliderLabel = () => {
    if (marginValue[0] < 0) return <>{rivalry.team_a_name} by {Math.abs(marginValue[0])}</>;
    if (marginValue[0] > 0) return <>{rivalry.team_b_name} by {marginValue[0]}</>;
    return "Slide to pick winner & margin";
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
          <span className="text-white text-3xl font-bold">🍔</span>
        </div>
        <h1 className="text-6xl font-bold text-white text-center mb-2">
          Muck <span className="text-4xl">'</span><span className="text-5xl">d</span>
        </h1>
        <p className="text-purple-400 text-xl text-center">
          Turning Playtime into Paytime
        </p>
      </div>

      {/* Main Button */}
      <div className="mb-8">
        <Button 
          size="lg" 
          className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3"
          onClick={() => {
            // Scroll to betting section or show betting interface
            const bettingSection = document.getElementById('betting-section');
            if (bettingSection) {
              bettingSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span className="text-2xl">🎯</span>
          Pick your Mucker
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Betting Section */}
      <div id="betting-section" className="w-full max-w-4xl space-y-8">
        {rivalry.rivalry_name && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">{rivalry.rivalry_name}</h2>
          </div>
        )}

        <Card className="bg-slate-800 border-slate-700 text-white overflow-hidden relative">
          {bettingClosed && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                  <Lock className="w-12 h-12 text-yellow-400" />
                  <h3 className="text-2xl font-bold mt-2">Betting Closed</h3>
                  <p>Results are in for Week {rivalry.week_number}</p>
              </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center p-6 md:p-8">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <img src={rivalry.team_a_logo_url || "https://placehold.co/80"} alt={rivalry.team_a_name} className="w-20 h-20 rounded-full bg-slate-700 mb-2"/>
              <h2 className="text-2xl font-bold">{rivalry.team_a_name}</h2>
              <p className="text-slate-400">{rivalry.team_a_owner}</p>
              <p className="font-mono text-yellow-400">{rivalry.team_a_record}</p>
            </div>
            <div className="text-center py-4 md:py-0">
              <p className="text-white text-sm">Week {rivalry.week_number}</p>
              <h3 className="text-4xl font-black text-yellow-400 my-1">VS</h3>
              <p className="text-slate-300 text-sm italic">For a $40 DoorDash Muck</p>
            </div>
            <div className="flex flex-col items-center text-center md:items-end md:text-right">
              <img src={rivalry.team_b_logo_url || "https://placehold.co/80"} alt={rivalry.team_b_name} className="w-20 h-20 rounded-full bg-slate-700 mb-2"/>
              <h2 className="text-2xl font-bold">{rivalry.team_b_name}</h2>
              <p className="text-slate-400">{rivalry.team_b_owner}</p>
              <p className="font-mono text-yellow-400">{rivalry.team_b_record}</p>
            </div>
          </div>
        </Card>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-yellow-400" />
            Margin Betting Pool ($5)
          </CardTitle>
          <div className="flex items-center gap-4 text-sm pt-2">
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-green-400"/> Pot: ${totalPot}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-400"/> Bettors: {bets.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          {!userName ? (
             <NameInputForm onNameSubmit={handleNameSubmit} />
          ) : bettingClosed ? (
            <Alert className="bg-slate-900/50 border-slate-700 text-slate-300">
              <Lock className="h-4 w-4" />
              <AlertDescription>Betting is closed for this matchup. See the results below.</AlertDescription>
            </Alert>
          ) : currentUserBets.length > 0 ? (
            <Alert className="bg-green-900/50 border-green-700 text-green-300">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your bet as <strong>{userName}</strong> is locked in! Good luck.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-slate-300">Betting as: <strong className="text-yellow-400">{userName}</strong></p>
              </div>
              <div className="px-1">
                  <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="font-bold text-blue-400">{rivalry.team_a_name}</span>
                      <span className="font-bold text-red-400">{rivalry.team_b_name}</span>
                  </div>
                  <Slider
                    value={marginValue}
                    onValueChange={setMarginValue}
                    max={30}
                    min={-30}
                    step={1}
                  />
                  <div className="text-center text-yellow-400 font-bold text-lg mt-4 h-7">
                      <MarginSliderLabel />
                  </div>
              </div>
              <Button 
                  onClick={handleMarginBet} 
                  disabled={marginValue[0] === 0} 
                  size="lg" 
                  className="w-full h-12 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-400"
              >
                Bet $5 - {marginValue[0] === 0 ? "Select Margin" : <MarginSliderLabel />}
              </Button>
            </div>
           )}
           
          {(userName && (currentUserBets.length > 0 || bettingClosed)) && (
            <div className="bg-slate-900 p-6 rounded-lg mt-6">
              <h4 className="font-bold mb-4 text-center">Betting Line Visualization</h4>
              <div className="relative">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-400 font-bold">{rivalry.team_a_name}</span>
                  <span className="text-red-400 font-bold">{rivalry.team_b_name}</span>
                </div>
                
                <div className="relative h-14 bg-slate-700 rounded-full">
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
                  
                  {bets.map(bet => {
                    const betValue = parseInt(bet.pick, 10);
                    const position = ((betValue + 30) / 60) * 100;
                    const isCurrentUser = bet.user_name === userName;
                    const initials = getInitials(bet.user_name);
                    
                    return (
                      <div
                        key={bet.id}
                        className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${position}%` }}
                        title={`${bet.user_name}: ${(() => {
                          const { team, points } = parseMarginBet(bet.pick);
                          return `${team === 'team_a' ? rivalry.team_a_name : rivalry.team_b_name} by ${points}`;
                        })()}`}
                      >
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-white whitespace-nowrap">
                          {initials}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 border-slate-900 ${
                            isCurrentUser ? 'bg-yellow-400' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between text-xs text-slate-400 px-1 mt-1">
                  <span>-30</span>
                  <span>-15</span>
                  <span>0</span>
                  <span>+15</span>
                  <span>+30</span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full ring-1 ring-yellow-200"></div>
                    <span>Your bet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span>Other bets</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-700 pt-4">
                <h5 className="font-semibold mb-3 text-center text-slate-300">All Bets</h5>
                <div className="space-y-2">
                  {bets.sort((a,b) => a.user_name.localeCompare(b.user_name)).map(bet => {
                    const { team, points } = parseMarginBet(bet.pick);
                    const isCurrentUser = bet.user_name === userName;
                    const teamName = team === 'team_a' ? rivalry.team_a_name : rivalry.team_b_name;
                    
                    return (
                      <div 
                        key={bet.id}
                        className={`flex justify-between items-center p-2 rounded ${
                          isCurrentUser ? 'bg-yellow-900/30 border border-yellow-600/50' : 'bg-slate-800'
                        }`}
                      >
                        <span className={`font-medium ${isCurrentUser ? 'text-yellow-400' : 'text-white'}`}>
                          {bet.user_name}
                          {isCurrentUser && ' (You)'}
                        </span>
                        <span className="text-slate-300">
                          {teamName} by {points}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && <AdminPanel rivalry={rivalry} bets={bets} fetchData={fetchData} />}
    </div>
  );
}
