import { useRef, useState } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, CalendarIcon, ChevronDown } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Category, Transaction, TransactionType } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: Omit<Transaction, "id">) => Promise<void> | void;
}

export function TransactionModal({ isOpen, onOpenChange, onSave }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const [amountCents, setAmountCents] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const VISIBLE_ROWS = 2;
  const COLS = 4;
  const visibleCategories = categoriesExpanded ? categories : categories.slice(0, VISIBLE_ROWS * COLS);
  const hasMore = categories.length > VISIBLE_ROWS * COLS;

  const formatAmountDisplay = (cents: string) => {
    const digits = cents.replace(/\D/g, "");
    if (!digits) return "";
    const num = parseInt(digits, 10);
    return (num / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setAmountCents(digits);
  };

  const amountValue = amountCents ? parseInt(amountCents, 10) / 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountCents || !selectedCategory) return;

    try {
      await onSave({
        amount: amountValue,
        description: description || selectedCategory.name,
        categoryId: selectedCategory.id,
        date: date.toISOString(),
        type,
      });
    } catch (error) {
      toast({
        title: "Falha ao salvar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Salvo ✅",
      description: "Transação adicionada com sucesso.",
    });

    // Reset form
    setAmountCents("");
    setDescription("");
    setSelectedCategory(null);
    setDate(new Date());
    setCategoriesExpanded(false);
    onOpenChange(false);
  };

  const handleConfirmPointerDown = () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
    formRef.current?.requestSubmit();
  };

  const handleDescriptionFocus = () => {
    setTimeout(() => {
      const container = scrollAreaRef.current;
      const input = descriptionRef.current;
      if (!container || !input) return;

      const containerRect = container.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const topLimit = containerRect.top + 16;
      const bottomLimit = containerRect.bottom - 170;

      if (inputRect.bottom > bottomLimit) {
        container.scrollTop += inputRect.bottom - bottomLimit;
      } else if (inputRect.top < topLimit) {
        container.scrollTop -= topLimit - inputRect.top;
      }
    }, 40);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} shouldScaleBackground={false} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[32px] fixed inset-x-0 bottom-0 top-6 z-50 outline-none shadow-2xl max-h-[100dvh]">
          <div ref={scrollAreaRef} className="p-6 bg-background rounded-t-[32px] flex-1 overflow-y-auto pb-32">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-10" />
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-10 max-w-md mx-auto pb-8">
              <div className="flex justify-center">
                <div className="bg-secondary/50 p-1.5 rounded-2xl flex w-full">
                  <button
                    type="button"
                    onClick={() => { setType("income"); setSelectedCategory(null); setCategoriesExpanded(false); }}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                      type === "income" 
                        ? "bg-white shadow-premium text-green-600" 
                        : "text-muted-foreground opacity-60"
                    )}
                  >
                    <ArrowUpCircle className="w-4 h-4" /> ENTRADA
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType("expense"); setSelectedCategory(null); setCategoriesExpanded(false); }}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                      type === "expense" 
                        ? "bg-white shadow-premium text-red-500" 
                        : "text-muted-foreground opacity-60"
                    )}
                  >
                    <ArrowDownCircle className="w-4 h-4" /> SAÍDA
                  </button>
                </div>
              </div>

              {/* Dominant Amount Input */}
              <div className="space-y-3 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">Valor da Transação</Label>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-xl md:text-2xl font-black text-muted-foreground/30 leading-none">R$</span>
                    <div className="relative inline-grid text-4xl md:text-5xl font-black leading-none">
                      <span className="invisible whitespace-pre px-0.5 min-w-[3ch]">
                        {formatAmountDisplay(amountCents) || "0,00"}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        className="absolute inset-0 w-full bg-transparent border-none outline-none text-center font-black text-4xl md:text-5xl placeholder:text-muted-foreground/15 text-foreground"
                        value={formatAmountDisplay(amountCents)}
                        onChange={handleAmountChange}
                      />
                    </div>
                  </div>
                  <div className="w-24 h-1 bg-primary/10 rounded-full" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black ml-1">Categoria</Label>
                <div className="grid grid-cols-4 gap-3">
                  {visibleCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-2xl border-2 transition-all active:scale-90",
                        selectedCategory?.id === cat.id
                          ? "border-primary bg-primary/5 shadow-premium"
                          : "border-transparent bg-secondary/30"
                      )}
                    >
                      <div className={cn("p-3 rounded-2xl text-white shadow-sm", cat.color)}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold leading-tight text-center text-foreground/80 w-full px-0.5 break-words">{cat.name}</span>
                    </button>
                  ))}
                </div>
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setCategoriesExpanded(v => !v)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {categoriesExpanded ? "Ver menos" : "Ver mais"}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        categoriesExpanded && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black ml-1">Data</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full bg-secondary/30 rounded-2xl h-14 px-6 font-medium justify-start text-left hover:bg-secondary/50"
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground/60 shrink-0" />
                      <span className={cn("text-sm", !date && "text-muted-foreground/40")}>
                        {date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => { if (d) { setDate(d); setCalendarOpen(false); } }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black ml-1">Mais Detalhes</Label>
                <Input
                  ref={descriptionRef}
                  placeholder="O que você comprou?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={handleDescriptionFocus}
                  className="bg-secondary/30 border-none rounded-2xl h-14 px-6 font-medium placeholder:text-muted-foreground/40"
                />
              </div>

              <div className="pt-6 flex gap-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-16 rounded-3xl text-muted-foreground font-bold uppercase tracking-widest text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button"
                  className="flex-[2] h-16 rounded-3xl text-lg font-black shadow-premium active:scale-95 transition-transform"
                  disabled={!amountCents || !selectedCategory}
                  onPointerDown={handleConfirmPointerDown}
                >
                  Confirmar
                </Button>
              </div>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
