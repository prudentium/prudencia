import { useState, useMemo, useRef } from "react";
import { ArrowLeft, Wallet, TrendingUp, AlertTriangle, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn, formatCurrency } from "@/lib/utils";
import { Transaction } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const MIN_BUDGET = 500;
const MAX_BUDGET = 20000;
const STEP = 50;

interface BudgetSettingsProps {
  currentBudget: number;
  transactions: Transaction[];
  onSave: (value: number) => Promise<void>;
  onBack: () => void;
}

export default function BudgetSettings({ currentBudget, transactions, onSave, onBack }: BudgetSettingsProps) {
  const [budget, setBudget] = useState(currentBudget);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions
      .filter(t => t.type === "expense" && new Date(t.date) >= thisMonthStart)
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const remaining = budget - thisMonthExpenses;
  const percentUsed = budget > 0 ? Math.min(Math.round((thisMonthExpenses / budget) * 100), 999) : 0;
  const isOverBudget = thisMonthExpenses > budget;

  const suggestedBudget = useMemo(() => {
    const now = new Date();
    const monthlyTotals: number[] = [];

    for (let i = 1; i <= 3; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const total = transactions
        .filter(t => t.type === "expense" && new Date(t.date) >= start && new Date(t.date) <= end)
        .reduce((acc, t) => acc + t.amount, 0);
      if (total > 0) monthlyTotals.push(total);
    }

    if (monthlyTotals.length === 0) return null;

    const avg = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
    return Math.ceil(avg / STEP) * STEP;
  }, [transactions]);

  const formatInputDisplay = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) {
      setBudget(MIN_BUDGET);
      return;
    }
    const num = parseInt(digits, 10) / 100;
    const clamped = Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, num));
    setBudget(clamped);
  };

  const handleSliderChange = (values: number[]) => {
    setBudget(values[0]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(budget);
      toast({
        title: "Limite salvo",
        description: `Seu limite mensal agora é ${formatCurrency(budget)}.`,
      });
      onBack();
    } catch (error) {
      toast({
        title: "Falha ao salvar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputBlur = () => {
    const clamped = Math.round(budget / STEP) * STEP;
    setBudget(Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, clamped)));
  };

  const progressBarPercent = Math.min(percentUsed, 100);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 shrink-0"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Limite de Gastos</h1>
            <p className="text-xs text-muted-foreground">Defina quanto deseja gastar por mês</p>
          </div>
        </div>
        <button
          disabled={isSaving || budget === currentBudget}
          onClick={handleSave}
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 animate-in fade-in",
            budget !== currentBudget && !isSaving
              ? "bg-primary text-white shadow-md shadow-primary/30 active:scale-90 hover:brightness-110 cursor-pointer"
              : "bg-secondary text-muted-foreground/40 cursor-not-allowed"
          )}
        >
          <Check className="w-5 h-5" />
        </button>
      </div>

      {/* Big Value Display */}
      <Card className="border-none shadow-soft overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary text-white shadow-sm mx-auto">
              <Wallet className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Limite Mensal</p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-lg font-black text-muted-foreground/30">R$</span>
                <div className="relative inline-grid text-4xl font-black leading-none">
                  <span className="invisible whitespace-pre px-0.5 min-w-[3ch]">
                    {formatInputDisplay(budget)}
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    className="absolute inset-0 w-full bg-transparent border-none outline-none text-center font-black text-4xl text-foreground"
                    value={formatInputDisplay(budget)}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slider */}
      <Card className="border-none shadow-soft overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Ajustar valor</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {formatCurrency(MIN_BUDGET)} — {formatCurrency(MAX_BUDGET)}
            </span>
          </div>
          <Slider
            value={[budget]}
            onValueChange={handleSliderChange}
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={STEP}
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/60 font-medium">
            <span>R$ 500</span>
            <span>R$ 5k</span>
            <span>R$ 10k</span>
            <span>R$ 15k</span>
            <span>R$ 20k</span>
          </div>
        </CardContent>
      </Card>

      {/* Progress & Feedback */}
      <Card className="border-none shadow-soft overflow-hidden">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className={cn(
              "p-2 rounded-xl shadow-sm shrink-0",
              isOverBudget
                ? "bg-gradient-to-br from-red-400 to-red-500 text-white"
                : percentUsed >= 80
                  ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white"
                  : "bg-gradient-to-br from-primary/80 to-primary text-white"
            )}>
              {isOverBudget ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
            <span className="text-sm font-bold">
              {isOverBudget ? "Limite ultrapassado!" : percentUsed >= 80 ? "Atenção ao limite" : "Dentro do limite"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative h-3 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  isOverBudget
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : percentUsed >= 80
                      ? "bg-gradient-to-r from-orange-400 to-amber-500"
                      : "bg-gradient-to-r from-primary/70 to-primary"
                )}
                style={{ width: `${progressBarPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className={cn(
                "text-xs font-bold",
                isOverBudget ? "text-red-500" : percentUsed >= 80 ? "text-orange-500" : "text-primary"
              )}>
                {percentUsed}% utilizado
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {formatCurrency(thisMonthExpenses)} / {formatCurrency(budget)}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-secondary/40 rounded-2xl p-3 text-center">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Gastos</p>
              <p className="text-sm font-bold text-foreground">{formatCurrency(thisMonthExpenses)}</p>
            </div>
            <div className="bg-secondary/40 rounded-2xl p-3 text-center">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Restante</p>
              <p className={cn("text-sm font-bold", isOverBudget ? "text-red-500" : "text-green-600")}>
                {isOverBudget ? "-" : ""}{formatCurrency(Math.abs(remaining))}
              </p>
            </div>
            <div className="bg-secondary/40 rounded-2xl p-3 text-center">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Usado</p>
              <p className={cn(
                "text-sm font-bold",
                isOverBudget ? "text-red-500" : percentUsed >= 80 ? "text-orange-500" : "text-primary"
              )}>
                {percentUsed}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestion */}
      {suggestedBudget && (
        <Card className="border-none shadow-soft overflow-hidden bg-primary/5 border-primary/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Sugestão inteligente</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Baseado no seu histórico, o orçamento sugerido é{" "}
                  <span className="font-bold text-foreground">{formatCurrency(suggestedBudget)}</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 px-3 text-xs font-bold text-primary hover:bg-primary/10"
                  onClick={() => setBudget(suggestedBudget)}
                >
                  Usar sugestão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
