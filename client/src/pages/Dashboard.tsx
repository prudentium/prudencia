import { useMemo } from "react";
import { ArrowDown, ArrowUp, Bell, Lightbulb, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Transaction, getCategory } from "@/lib/mockData";
import { cn, formatCurrency, formatShortDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

interface DashboardProps {
  transactions: Transaction[];
  userName?: string;
  userAvatarUrl?: string;
  monthlyBudget?: number;
}

export default function Dashboard({ transactions, userName, userAvatarUrl, monthlyBudget = 5000 }: DashboardProps) {
  const displayName = userName?.trim() || "Jane";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSrc = userAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  // Calculate Totals
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Smart Insights: month-over-month comparison
  const insights = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthExpenses = transactions
      .filter(t => t.type === "expense" && new Date(t.date) >= thisMonthStart)
      .reduce((acc, t) => acc + t.amount, 0);

    const lastMonthExpenses = transactions
      .filter(t => t.type === "expense" && new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd)
      .reduce((acc, t) => acc + t.amount, 0);

    const budgetUsed = thisMonthExpenses;
    const budgetPercent = Math.min(Math.round((budgetUsed / monthlyBudget) * 100), 100);

    let savingsPercent = 0;
    let isSaving = true;
    if (lastMonthExpenses > 0) {
      const diff = lastMonthExpenses - thisMonthExpenses;
      savingsPercent = Math.abs(Math.round((diff / lastMonthExpenses) * 100));
      isSaving = diff > 0;
    }

    // Top spending category this month
    const categorySpending: Record<string, number> = {};
    transactions
      .filter(t => t.type === "expense" && new Date(t.date) >= thisMonthStart)
      .forEach(t => {
        categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount;
      });
    const topCategoryId = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCategory = topCategoryId ? getCategory(topCategoryId) : null;

    return { thisMonthExpenses, lastMonthExpenses, savingsPercent, isSaving, budgetUsed, budgetPercent, topCategory };
  }, [transactions, monthlyBudget]);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-500 max-w-lg mx-auto">
      {/* Greeting Header */}
      <div className="flex items-center justify-between pt-2 px-1">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-primary/20 shadow-sm">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{getGreeting()} 👋</p>
            <h1 className="text-base font-bold tracking-tight text-foreground leading-tight">{displayName}</h1>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-secondary/60">
          <Bell className="w-5 h-5" />
        </Button>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-violet-600 p-5 pb-5 shadow-lg">
        {/* Decorative wallet icon */}
        <div className="absolute top-4 right-4 opacity-20">
          <Wallet className="w-16 h-16 text-white" />
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5" />

        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Saldo total</p>
        <h2 className="text-3xl font-bold text-white tracking-tight truncate mb-4">
          {formatCurrency(balance)}
        </h2>

        {/* Income / Expense inside the card */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
              <ArrowUp className="w-3.5 h-3.5 text-green-300" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-white/60 font-semibold uppercase tracking-tight block">Receitas</span>
              <span className="text-sm font-bold text-white truncate block">{formatCurrency(totalIncome)}</span>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
              <ArrowDown className="w-3.5 h-3.5 text-red-300" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-white/60 font-semibold uppercase tracking-tight block">Despesas</span>
              <span className="text-sm font-bold text-white truncate block">{formatCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Smart Insights */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold tracking-tight">Insights Inteligentes</h2>
          <Link href="/categories">
            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold hover:bg-transparent px-0">Ver tudo</Button>
          </Link>
        </div>

        {/* Savings Insight */}
        <Card className="shadow-sm border-none bg-white dark:bg-card overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2.5 rounded-xl shrink-0 shadow-sm",
                insights.isSaving
                  ? "bg-gradient-to-br from-purple-500 to-violet-600 text-white"
                  : "bg-gradient-to-br from-orange-400 to-red-500 text-white"
              )}>
                {insights.isSaving ? <TrendingDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {insights.isSaving ? "Economia este mês" : "Atenção aos gastos"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {insights.lastMonthExpenses > 0 ? (
                    insights.isSaving ? (
                      <>Você gastou <span className="font-bold text-foreground">{insights.savingsPercent}% menos</span> que no mês passado. Continue assim!</>
                    ) : (
                      <>Você gastou <span className="font-bold text-foreground">{insights.savingsPercent}% mais</span> que no mês passado. Fique atento!</>
                    )
                  ) : (
                    <>Primeiro mês registrado. Continue adicionando transações!</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Progress Insight */}
        <Card className="shadow-sm border-none bg-white dark:bg-card overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/80 to-primary text-white shadow-sm shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-foreground">Limite de Gastos</span>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {formatCurrency(insights.budgetUsed)} / {formatCurrency(monthlyBudget)}
              </span>
            </div>
            <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  insights.budgetPercent >= 90
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : insights.budgetPercent >= 70
                      ? "bg-gradient-to-r from-orange-400 to-amber-500"
                      : "bg-gradient-to-r from-primary/70 to-primary"
                )}
                style={{ width: `${insights.budgetPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Category Insight */}
        {insights.topCategory && (
          <Card className="shadow-sm border-none bg-white dark:bg-card overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl text-white shadow-sm shrink-0", insights.topCategory.color)}>
                  <insights.topCategory.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">Maior gasto: {insights.topCategory.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Categoria com mais despesas neste mês
                  </p>
                </div>
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 ml-auto" />
              </div>
            </CardContent>
          </Card>
        )}
      </section>
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
