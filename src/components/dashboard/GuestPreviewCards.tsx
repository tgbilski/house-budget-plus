import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lock, Mic, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

// Demo data for expenses chart
const demoExpenseData = [
  { month: 'Jan', amount: 1240 },
  { month: 'Feb', amount: 980 },
  { month: 'Mar', amount: 1560 },
  { month: 'Apr', amount: 1100 },
  { month: 'May', amount: 890 },
  { month: 'Jun', amount: 1320 },
  { month: 'Jul', amount: 1050 },
  { month: 'Aug', amount: 1480 },
  { month: 'Sep', amount: 920 },
  { month: 'Oct', amount: 1200 },
  { month: 'Nov', amount: 1680 },
  { month: 'Dec', amount: 2100 },
];

// Demo savings goals
const demoSavingsGoals = [
  { name: 'Emergency Fund', saved: 3200, target: 10000 },
  { name: 'Vacation 2026', saved: 1800, target: 5000 },
  { name: 'New Car', saved: 4500, target: 15000 },
];

const GuestPreviewCards: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
      {/* Expenses Preview */}
      <div className="relative">
        <Card className="border-[3px] border-stroke shadow-cartoon overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mic className="h-5 w-5 text-teal" />
              Voice Expense Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-primary/5 p-3 text-center">
                <p className="text-xs text-muted-foreground uppercase">Year Total</p>
                <p className="text-xl font-bold text-primary">$15,420</p>
              </div>
              <div className="rounded-lg bg-teal/5 p-3 text-center">
                <p className="text-xs text-muted-foreground uppercase">This Month</p>
                <p className="text-xl font-bold text-teal">$1,240</p>
              </div>
              <div className="rounded-lg bg-success/5 p-3 text-center">
                <p className="text-xs text-muted-foreground uppercase">Monthly Avg</p>
                <p className="text-xl font-bold text-success">$1,285</p>
              </div>
            </div>

            {/* Demo chart */}
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoExpenseData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={35} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v}`, 'Spent']} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Demo recent expenses */}
            <div className="space-y-2">
              {[
                { amount: 45.99, merchant: 'Whole Foods', category: 'Groceries' },
                { amount: 12.50, merchant: 'Starbucks', category: 'Dining Out' },
                { amount: 89.00, merchant: 'Shell Gas', category: 'Transportation' },
              ].map((exp, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                  <div>
                    <span className="font-semibold">${exp.amount.toFixed(2)}</span>
                    <span className="text-muted-foreground ml-2">{exp.merchant}</span>
                  </div>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">{exp.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-transparent rounded-xl flex flex-col items-center justify-end pb-6 px-4">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Lock className="h-4 w-4" />
              Premium Feature
            </div>
            <p className="text-foreground font-bold text-lg">Track every dollar with your voice</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Just say "spent $45 at Whole Foods on groceries" — AI handles the rest.
            </p>
            <Button asChild size="sm">
              <Link to="/signup">Sign Up Free to Start Tracking</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Savings Preview */}
      <div className="relative">
        <Card className="border-[3px] border-stroke shadow-cartoon overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-success" />
              Savings Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoSavingsGoals.map((goal, i) => {
              const pct = (goal.saved / goal.target) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{goal.name}</span>
                    <span className="text-muted-foreground">
                      ${goal.saved.toLocaleString()} / ${goal.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={cn(
                        "rounded-full h-3 transition-all duration-700",
                        i === 0 ? "bg-success" : i === 1 ? "bg-primary" : "bg-teal"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{pct.toFixed(0)}% complete</p>
                </div>
              );
            })}

            {/* Monthly grid preview */}
            <div className="grid grid-cols-6 gap-1.5 mt-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <div key={m} className={cn(
                  "text-center p-2 rounded-lg text-xs",
                  i < 3 ? "bg-success/10 text-success font-semibold" : "bg-muted/30 text-muted-foreground"
                )}>
                  <div className="font-medium">{m}</div>
                  <div>{i < 3 ? `$${(200 + i * 150)}` : '—'}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-transparent rounded-xl flex flex-col items-center justify-end pb-6 px-4">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-semibold">
              <Target className="h-4 w-4" />
              Free with Sign Up
            </div>
            <p className="text-foreground font-bold text-lg">Watch your savings grow month by month</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Set up to 3 savings goals, track monthly contributions, and celebrate milestones.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/signup">Create Your First Goal →</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestPreviewCards;
