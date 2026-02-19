import { useState } from "react";
import { Drawer } from "vaul";
import { ChevronRight } from "lucide-react";
import { subDays, subMonths, subYears, startOfDay } from "date-fns";
import { EXPENSE_CATEGORIES, Transaction } from "@/lib/mockData";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface CategoriesProps {
  transactions: Transaction[];
}

export default function Categories({ transactions }: CategoriesProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<PeriodLabel>("30d");

  const periodFrom = getPeriodFrom(activePeriod);
  const filtered = transactions.filter(t => new Date(t.date) >= periodFrom);

  // Calculate spending per category (expense only)
  const categoryStats = EXPENSE_CATEGORIES.map(cat => {
    const totalSpent = filtered
      .filter(t => t.categoryId === cat.id && t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const budget = cat.budget || 1000;
    const percentage = Math.min((totalSpent / budget) * 100, 100);

    return { ...cat, totalSpent, percentage };
  }).filter(cat => cat.totalSpent > 0).sort((a, b) => b.totalSpent - a.totalSpent);

  const totalExpenses = filtered
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const selectedCategory = selectedCategoryId ? categoryStats.find(c => c.id === selectedCategoryId) : null;
  const selectedTransactions = selectedCategoryId
    ? filtered.filter(t => t.categoryId === selectedCategoryId)
    : [];

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Categorias</h1>
          <p className="text-muted-foreground text-sm">Onde você gasta mais</p>
        </div>
        <div className="flex items-center gap-1">
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
      </header>

      <div className="grid grid-cols-1 gap-4">
        {categoryStats.map((cat) => (
          <div 
            key={cat.id} 
            onClick={() => setSelectedCategoryId(cat.id)}
            className="group relative overflow-hidden bg-card rounded-2xl p-4 shadow-sm border border-transparent hover:border-primary/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl text-white shadow-sm", cat.color)}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((cat.totalSpent / totalExpenses) * 100) || 0}% dos gastos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-bold text-base">{formatCurrency(cat.totalSpent)}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000 ease-out", cat.color.replace('bg-', 'bg-opacity-80 bg-'))} 
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Category Detail Drawer */}
      <Drawer.Root open={!!selectedCategoryId} onOpenChange={(open) => !open && setSelectedCategoryId(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="bg-background flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-50 outline-none">
            <div className="p-4 bg-background rounded-t-[20px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
              
              {selectedCategory && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white shadow-lg mb-4", selectedCategory.color)}>
                      <selectedCategory.icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                    <p className="text-3xl font-bold text-foreground/80">{formatCurrency(selectedCategory.totalSpent)}</p>
                    <p className="text-sm text-muted-foreground">Gasto total neste mês</p>
                  </div>

                  <div className="space-y-4 pt-6">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider ml-1">Histórico</h3>
                    {selectedTransactions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhuma transação nesta categoria.</p>
                    ) : (
                      selectedTransactions.map((t) => (
                        <Card key={t.id} className="shadow-none border bg-secondary/30">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium">{t.description}</p>
                              <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <span className="font-bold text-red-500">- {formatCurrency(t.amount)}</span>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
