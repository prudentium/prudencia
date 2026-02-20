import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Categories from "@/pages/Categories";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import { BottomNav } from "@/components/BottomNav";
import { TransactionModal } from "@/components/TransactionModal";
import { useState, useEffect } from "react";
import { Transaction } from "@/lib/mockData";
import { createTransaction, loadTransactions, removeTransaction } from "@/lib/transactionsStore";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

function Router() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      setIsLoadingTransactions(true);
      try {
        const data = await loadTransactions();
        if (mounted) setTransactions(data);
      } catch (error) {
        console.error("Falha ao carregar transações:", error);
      } finally {
        if (mounted) setIsLoadingTransactions(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [session]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background pb-16 font-sans antialiased text-foreground">
        <div className="max-w-md mx-auto min-h-screen bg-background relative border-x border-border/40 shadow-2xl shadow-black/5">
          <main className="p-4 pt-6">
            <div className="py-16 text-center text-sm text-muted-foreground">Carregando autenticação...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="min-h-screen bg-background pb-16 font-sans antialiased text-foreground">
        <div className="max-w-md mx-auto min-h-screen bg-background relative border-x border-border/40 shadow-2xl shadow-black/5">
          <main className="p-6 pt-10">
            <div className="rounded-3xl border border-border/60 bg-card p-5 text-sm text-muted-foreground">
              Configure <span className="font-semibold text-foreground">VITE_SUPABASE_URL</span> e <span className="font-semibold text-foreground">VITE_SUPABASE_ANON_KEY</span> em <span className="font-semibold text-foreground">client/.env</span> para habilitar login.
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const userName =
    (session.user.user_metadata?.full_name as string | undefined) ||
    (session.user.email?.split("@")[0] ?? "Usuário");
  const userAvatarUrl = session.user.user_metadata?.avatar_url as string | undefined;

  const handleAddTransaction = async (newTx: Omit<Transaction, "id">) => {
    const transaction = await createTransaction(newTx);
    setTransactions((prev) => [transaction, ...prev]);
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await removeTransaction(id);
    } catch (error) {
      console.error("Falha ao remover transação:", error);
      const fresh = await loadTransactions();
      setTransactions(fresh);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 font-sans antialiased text-foreground">
      <div className="max-w-md mx-auto min-h-screen bg-background relative border-x border-border/40 shadow-2xl shadow-black/5">
        <main className="p-4 pt-6">
          {isLoadingTransactions ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Carregando transações...</div>
          ) : (
          <Switch>
            <Route path="/">
              <Dashboard transactions={transactions} userName={userName} userAvatarUrl={userAvatarUrl} />
            </Route>
            <Route path="/transactions">
              <Transactions transactions={transactions} onDelete={handleDeleteTransaction} />
            </Route>
            <Route path="/categories">
              <Categories transactions={transactions} />
            </Route>
            <Route path="/settings">
              <Settings onLogout={handleLogout} userName={userName} userEmail={session.user.email ?? ""} />
            </Route>
            <Route component={NotFound} />
          </Switch>
          )}
        </main>
        
        <BottomNav onOpenNewTransaction={() => setIsModalOpen(true)} />
        
        <TransactionModal 
          isOpen={isModalOpen} 
          onOpenChange={setIsModalOpen}
          onSave={handleAddTransaction}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
