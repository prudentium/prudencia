import { INITIAL_TRANSACTIONS, Transaction } from "@/lib/mockData";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const LOCAL_STORAGE_KEY = "transactions";

type TransactionRow = {
  id: string;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  type: "income" | "expense";
};

const toTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  amount: Number(row.amount),
  description: row.description,
  categoryId: row.category_id,
  date: row.date,
  type: row.type,
});

const toTransactionRow = (tx: Omit<Transaction, "id">): Omit<TransactionRow, "id"> => ({
  amount: tx.amount,
  description: tx.description,
  category_id: tx.categoryId,
  date: tx.date,
  type: tx.type,
});

function loadFromLocalStorage(): Transaction[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }

  try {
    return JSON.parse(saved) as Transaction[];
  } catch {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
}

function saveToLocalStorage(transactions: Transaction[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
}

export async function loadTransactions(): Promise<Transaction[]> {
  if (!isSupabaseConfigured || !supabase) {
    return loadFromLocalStorage();
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("id, amount, description, category_id, date, type")
    .order("date", { ascending: false });

  if (error) {
    console.error("Erro ao carregar transações do Supabase:", error.message);
    return loadFromLocalStorage();
  }

  return (data ?? []).map(toTransaction);
}

export async function createTransaction(newTx: Omit<Transaction, "id">): Promise<Transaction> {
  if (!isSupabaseConfigured || !supabase) {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substring(2, 11),
    };

    const current = loadFromLocalStorage();
    const updated = [transaction, ...current];
    saveToLocalStorage(updated);
    return transaction;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(toTransactionRow(newTx))
    .select("id, amount, description, category_id, date, type")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Falha ao criar transação no Supabase");
  }

  return toTransaction(data);
}

export async function removeTransaction(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const current = loadFromLocalStorage();
    saveToLocalStorage(current.filter((t) => t.id !== id));
    return;
  }

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
