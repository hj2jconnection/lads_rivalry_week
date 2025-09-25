import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RivalryWeek, Bet } from "@/api/entities";
import { Trash2, Edit, Save, Award, RefreshCw, DollarSign, PlusCircle } from "lucide-react";

export default function AdminPanel({ rivalry, bets, fetchData }) {
  const [rivalryForm, setRivalryForm] = useState({});
  const [newRivalryForm, setNewRivalryForm] = useState({
    week_number: 1,
    rivalry_name: '',
    team_a_name: '',
    team_a_owner: '',
    team_a_record: '',
    team_a_logo_url: '',
    team_b_name: '',
    team_b_owner: '',
    team_b_record: '',
    team_b_logo_url: '',
  });
  const [resultForm, setResultForm] = useState({ winning_team: '', final_margin: '' });
  const [payouts, setPayouts] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rivalry) {
      setRivalryForm({
        week_number: rivalry.week_number || '',
        rivalry_name: rivalry.rivalry_name || '',
        team_a_name: rivalry.team_a_name || '',
        team_a_owner: rivalry.team_a_owner || '',
        team_a_record: rivalry.team_a_record || '',
        team_a_logo_url: rivalry.team_a_logo_url || '',
        team_b_name: rivalry.team_b_name || '',
        team_b_owner: rivalry.team_b_owner || '',
        team_b_record: rivalry.team_b_record || '',
        team_b_logo_url: rivalry.team_b_logo_url || '',
      });
      if (rivalry.status === 'completed') {
        calculatePayouts();
      } else {
        setPayouts(null);
      }
    }
  }, [rivalry, bets]);

  const handleCreateRivalry = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await RivalryWeek.create({...newRivalryForm, week_number: Number(newRivalryForm.week_number)});
      await fetchData();
    } catch (error) {
      console.error("Failed to create rivalry:", error);
    }
    setIsSaving(false);
  };

  const handleRivalryUpdate = async (e) => {
    e.preventDefault();
    if (!rivalry) return;
    setIsSaving(true);
    try {
      await RivalryWeek.update(rivalry.id, {
        ...rivalryForm,
        status: 'upcoming',
        winning_team: null,
        final_margin: null,
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to update rivalry:", error);
    }
    setIsSaving(false);
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    if (!rivalry) return;
    setIsSaving(true);
    try {
      await RivalryWeek.update(rivalry.id, {
        status: 'completed',
        winning_team: resultForm.winning_team,
        final_margin: parseFloat(resultForm.final_margin),
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to submit result:", error);
    }
    setIsSaving(false);
  };
  
  const handleClearBets = async () => {
    if (window.confirm("Are you sure you want to delete ALL bets? This cannot be undone.")) {
      setIsSaving(true);
      try {
        const betIds = bets.map(b => b.id);
        for (const id of betIds) {
            await Bet.delete(id);
        }
        await fetchData();
      } catch (error) {
        console.error("Failed to clear bets:", error);
      }
      setIsSaving(false);
    }
  };

  const calculatePayouts = () => {
    if (!rivalry || rivalry.status !== 'completed' || !bets.length) {
      setPayouts(null);
      return;
    }

    const marginBets = bets.filter(b => b.bet_type === 'margin');
    const marginPot = marginBets.length * 5;
    let marginPoolWinners = [];
    let marginPayout = 0;

    if (marginBets.length > 0) {
      let closestDiff = Infinity;
      marginBets.forEach(bet => {
        const betMargin = parseInt(bet.pick, 10);
        const actualMarginSign = rivalry.winning_team === 'team_b' ? 1 : -1;
        const actualMargin = rivalry.final_margin * actualMarginSign;
        
        const diff = Math.abs(betMargin - actualMargin);

        if (diff < closestDiff) {
          closestDiff = diff;
          marginPoolWinners = [bet];
        } else if (diff === closestDiff) {
          marginPoolWinners.push(bet);
        }
      });
      marginPayout = marginPoolWinners.length > 0 ? marginPot / marginPoolWinners.length : 0;
    }
    
    setPayouts({
        margin: { winners: marginPoolWinners, payout: marginPayout.toFixed(2), pot: marginPot }
    });
  };

  if (!rivalry) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle /> Create New Rivalry Week</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRivalry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(newRivalryForm).map(key => (
              <div key={key}>
                <Label htmlFor={`create-${key}`} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                <Input 
                  id={`create-${key}`} 
                  name={key}
                  type={key === 'week_number' ? 'number' : 'text'}
                  value={newRivalryForm[key]} 
                  onChange={e => setNewRivalryForm({...newRivalryForm, [e.target.name]: e.target.value})} 
                  className="bg-slate-900 border-slate-600" 
                  placeholder={key.replace(/_/g, ' ')}
                  required={['week_number', 'rivalry_name', 'team_a_name', 'team_b_name'].includes(key)}
                />
              </div>
            ))}
            <div className="md:col-span-2 mt-4">
              <Button type="submit" disabled={isSaving} className="w-full bg-green-600 hover:bg-green-500">
                <Save className="w-4 h-4 mr-2" />
                Create Rivalry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-white mt-12">
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
        {rivalry.rivalry_name && (
          <div className="text-xl font-bold text-yellow-400">{rivalry.rivalry_name}</div>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Edit /> Update Rivalry Info</h3>
          <form onSubmit={handleRivalryUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(rivalryForm).map(key => (
              <div key={key}>
                <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                <Input 
                  id={key} 
                  name={key} 
                  value={rivalryForm[key]} 
                  onChange={e => setRivalryForm({...rivalryForm, [e.target.name]: e.target.value})} 
                  className="bg-slate-900 border-slate-600" 
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500">
                <Save className="w-4 h-4 mr-2" />
                Save Rivalry Changes
              </Button>
            </div>
          </form>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Award /> Enter Game Result</h3>
          {rivalry.status === 'completed' ? (
              <Alert className="bg-green-900/50 border-green-700 text-green-300">This week's results are in. Payouts calculated below.</Alert>
          ) : (
            <form onSubmit={handleResultSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Label>Winning Team</Label>
                    <Select onValueChange={value => setResultForm({...resultForm, winning_team: value})}>
                        <SelectTrigger className="bg-slate-900 border-slate-600"><SelectValue placeholder="Select winner..." /></SelectTrigger>
                        <SelectContent><SelectItem value="team_a">{rivalry.team_a_name}</SelectItem><SelectItem value="team_b">{rivalry.team_b_name}</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <Label>Final Margin (e.g., 14.5)</Label>
                    <Input type="number" step="0.5" value={resultForm.final_margin} onChange={e => setResultForm({...resultForm, final_margin: e.target.value})} className="bg-slate-900 border-slate-600" />
                </div>
                <Button type="submit" disabled={isSaving} className="self-end bg-green-600 hover:bg-green-500">Submit Result & Calculate Payouts</Button>
            </form>
          )}
        </section>

        {payouts && (
            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><DollarSign /> Payouts</h3>
                <div className="bg-slate-900 p-4 rounded-lg">
                    <h4 className="font-bold">Margin Pool - Pot: ${payouts.margin.pot}</h4>
                     {payouts.margin.winners.length > 0 ? (
                        <>
                            <p className="text-sm text-green-400">Payout per winner: ${payouts.margin.payout}</p>
                            <ul>{payouts.margin.winners.map(w => <li key={w.id}>{w.user_name}</li>)}</ul>
                        </>
                    ) : <p>No winners.</p>}
                </div>
            </section>
        )}
      </CardContent>
      <CardFooter className="bg-slate-800/50">
        <Button onClick={handleClearBets} disabled={isSaving} variant="destructive" className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Bets for Next Week
        </Button>
      </CardFooter>
    </Card>
  );
}