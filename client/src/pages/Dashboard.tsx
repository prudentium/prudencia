import { useState } from "react";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { subDays, subMonths, subYears, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction, getCategory } from "@/lib/mockData";
import { cn, formatCurrency, formatShortDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface DashboardProps {
  transactions: Transaction[];
}

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "3m", months: 3 },
  { label: "1a", years: 1 },
] as const;

type PeriodLabel = typeof PERIODS[number]["label"];

function getPeriodFrom(label: PeriodLabel): Date {
  const now = new Date();
  if (label === "7d") return startOfDay(subDays(now, 7));
  if (label === "30d") return startOfDay(subDays(now, 30));
  if (label === "3m") return startOfDay(subMonths(now, 3));
  return startOfDay(subYears(now, 1));
}

export default function Dashboard({ transactions }: DashboardProps) {
  const [activePeriod, setActivePeriod] = useState<PeriodLabel>("30d");
  
  const periodFrom = getPeriodFrom(activePeriod);
  const filtered = transactions.filter(t => new Date(t.date) >= periodFrom);

  // Calculate Totals
  const totalIncome = filtered
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalExpense = filtered
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = filtered
    .filter(t => t.type === "expense")
    .reduce((acc: any[], t) => {
      const cat = getCategory(t.categoryId);
      const existing = acc.find(c => c.name === cat.name);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: cat.name, value: t.amount, color: cat.color });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-500 max-w-lg mx-auto">
      {/* Header: greeting + period filter */}
      <div className="flex items-start justify-between pt-4 px-1">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Bem-vindo 👋</p>
          <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">Jane</h1>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {PERIODS.map((p) => (
            <Button
              key={p.label}
              variant="ghost"
              size="sm"
              onClick={() => setActivePeriod(p.label)}
              className={cn(
                "h-7 rounded-full px-2.5 text-[10px] font-semibold transition-colors",
                activePeriod === p.label
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Balance */}
      <div className="px-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Seu Saldo</p>
        <div className="text-3xl font-bold tracking-tight text-foreground truncate max-w-full">
          {formatCurrency(balance)}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white dark:bg-card rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 shrink-0">
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-tight block">Receita</span>
            <span className="text-sm font-bold text-green-600 truncate block">{formatCurrency(totalIncome)}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 shrink-0">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-tight block">Despesa</span>
            <span className="text-sm font-bold text-red-500 truncate block">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </div>
      {/* Main Chart Card */}
      <Card className="shadow-premium border-none bg-white dark:bg-card pt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), '']}
                />
              </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-center">
                 <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">Total</span>
                 <span className="text-xl font-bold">{formatCurrency(totalExpense)}</span>
               </div>
             </div>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6">
            {expenseByCategory.map((entry, index) => (
              <div key={index} className="flex items-center gap-2.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate font-medium text-muted-foreground">{entry.name}</span>
                <span className="ml-auto font-bold">{Math.round((entry.value / totalExpense) * 100)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Recent Transactions */}
      <section className="space-y-4 pt-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold tracking-tight">Últimas Transações</h2>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold hover:bg-transparent px-0">Ver tudo</Button>
          </Link>
        </div>
        
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-3xl border-2 border-dashed border-muted">
              <p className="text-muted-foreground font-medium">Nenhuma transação ainda</p>
            </div>
          ) : (
            transactions.slice(0, 5).map((t) => {
              const category = getCategory(t.categoryId);
              return (
                <div key={t.id} className="flex items-center justify-between p-3 md:p-4 bg-white dark:bg-card rounded-2xl md:rounded-3xl shadow-soft border border-transparent active:scale-[0.99] transition-all">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={cn("p-2.5 md:p-3 rounded-xl md:rounded-2xl text-white shadow-sm shrink-0", category.color)}>
                      <category.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs md:text-sm tracking-tight">{t.description}</p>
                      <p className="text-[9px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{category.name} • {formatShortDate(t.date)}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-bold text-xs md:text-sm",
                    t.type === "income" ? "text-green-600" : "text-red-500"
                  )}>
                    {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
