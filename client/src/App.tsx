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
import { BottomNav } from "@/components/BottomNav";
import { TransactionModal } from "@/components/TransactionModal";
import { useState, useEffect } from "react";
import { INITIAL_TRANSACTIONS, Transaction } from "@/lib/mockData";

function Router() {
  // Global State for Transactions (Mock)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Load from local storage if available, else use initial
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (newTx: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTransactions([transaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-16 font-sans antialiased text-foreground">
      <div className="max-w-md mx-auto min-h-screen bg-background relative border-x border-border/40 shadow-2xl shadow-black/5">
        <main className="p-4 pt-6">
          <Switch>
            <Route path="/">
              <Dashboard transactions={transactions} />
            </Route>
            <Route path="/transactions">
              <Transactions transactions={transactions} onDelete={handleDeleteTransaction} />
            </Route>
            <Route path="/categories">
              <Categories transactions={transactions} />
            </Route>
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
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
