import { useState, useMemo } from "react";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Transaction, getCategory } from "@/lib/mockData";
import { cn, formatCurrency, formatShortDate } from "@/lib/utils";

interface TransactionsProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export default function Transactions({ transactions, onDelete }: TransactionsProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      const dateKey = formatShortDate(t.date);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm pb-2 pt-1">
        <h1 className="text-2xl font-bold mb-4">Transações</h1>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-none rounded-xl h-11"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Badge 
              variant={filterType === "all" ? "default" : "outline"}
              className="px-4 py-1.5 rounded-full cursor-pointer transition-all"
              onClick={() => setFilterType("all")}
            >
              Todos
            </Badge>
            <Badge 
              variant={filterType === "income" ? "default" : "outline"}
              className={cn(
                "px-4 py-1.5 rounded-full cursor-pointer transition-all", 
                filterType === "income" ? "bg-green-600 hover:bg-green-700" : ""
              )}
              onClick={() => setFilterType("income")}
            >
              Entradas
            </Badge>
            <Badge 
              variant={filterType === "expense" ? "default" : "outline"}
              className={cn(
                "px-4 py-1.5 rounded-full cursor-pointer transition-all", 
                filterType === "expense" ? "bg-red-500 hover:bg-red-600" : ""
              )}
              onClick={() => setFilterType("expense")}
            >
              Saídas
            </Badge>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {Object.entries(groupedTransactions).length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p>Nenhuma transação encontrada.</p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1 sticky top-32">{date}</h3>
              <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50">
                {items.map((t, index) => {
                  const category = getCategory(t.categoryId);
                  return (
                    <div key={t.id}>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2.5 rounded-full text-white shadow-sm shrink-0", category.color)}>
                            <category.icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate pr-2">{t.description}</p>
                            <p className="text-xs text-muted-foreground">{category.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn(
                            "font-bold text-sm whitespace-nowrap",
                            t.type === "income" ? "text-green-600" : "text-red-500"
                          )}>
                            {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                          </span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {index < items.length - 1 && <div className="h-[1px] bg-border/40 mx-4" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
