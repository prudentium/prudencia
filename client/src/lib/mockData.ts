import { LucideIcon, ShoppingCart, Home, Bus, Pizza, Gamepad2, HeartPulse, GraduationCap, Receipt, MoreHorizontal, Briefcase, TrendingUp, Wrench } from "lucide-react";

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  type: TransactionType;
  budget?: number;
  spent?: number;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO string
  type: TransactionType;
};

export const EXPENSE_CATEGORIES: Category[] = [
  { id: "home", name: "Casa", icon: Home, color: "bg-blue-500", type: "expense" },
  { id: "market", name: "Mercado", icon: ShoppingCart, color: "bg-green-500", type: "expense" },
  { id: "transport", name: "Transporte", icon: Bus, color: "bg-orange-500", type: "expense" },
  { id: "food", name: "Alimentação", icon: Pizza, color: "bg-yellow-500", type: "expense" },
  { id: "leisure", name: "Lazer", icon: Gamepad2, color: "bg-purple-500", type: "expense" },
  { id: "health", name: "Saúde", icon: HeartPulse, color: "bg-red-500", type: "expense" },
  { id: "education", name: "Educação", icon: GraduationCap, color: "bg-indigo-500", type: "expense" },
  { id: "subscriptions", name: "Assinaturas", icon: Receipt, color: "bg-pink-500", type: "expense" },
  { id: "maintenance", name: "Manutenção", icon: Wrench, color: "bg-amber-600", type: "expense" },
  { id: "others_expense", name: "Outros", icon: MoreHorizontal, color: "bg-gray-500", type: "expense" },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: "salary", name: "Salário", icon: Briefcase, color: "bg-green-600", type: "income" },
  { id: "freelance", name: "Freelance", icon: Wrench, color: "bg-blue-500", type: "income" },
  { id: "investments", name: "Investimentos", icon: TrendingUp, color: "bg-emerald-500", type: "income" },
  { id: "others_income", name: "Outros", icon: MoreHorizontal, color: "bg-gray-500", type: "income" },
];

export const CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

const generateTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Helper to subtract days
  const subDays = (days: number) => {
    const d = new Date();
    d.setDate(now.getDate() - days);
    return d.toISOString();
  };

  const sampleData = [
    { desc: "Compras Supermercado", amount: 450.50, cat: "market", type: "expense", date: subDays(0) },
    { desc: "Uber para trabalho", amount: 24.90, cat: "transport", type: "expense", date: subDays(0) },
    { desc: "Salário Mensal", amount: 5500.00, cat: "salary", type: "income", date: subDays(1) },
    { desc: "Netflix", amount: 55.90, cat: "subscriptions", type: "expense", date: subDays(2) },
    { desc: "Jantar Fora", amount: 120.00, cat: "food", type: "expense", date: subDays(3) },
    { desc: "Farmácia", amount: 85.30, cat: "health", type: "expense", date: subDays(4) },
    { desc: "Gasolina", amount: 200.00, cat: "transport", type: "expense", date: subDays(5) },
    { desc: "Internet", amount: 110.00, cat: "home", type: "expense", date: subDays(6) },
    { desc: "Freelance Design", amount: 1200.00, cat: "freelance", type: "income", date: subDays(7) },
    { desc: "Cinema", amount: 45.00, cat: "leisure", type: "expense", date: subDays(8) },
    { desc: "Curso Inglês", amount: 350.00, cat: "education", type: "expense", date: subDays(10) },
    { desc: "Spotify", amount: 21.90, cat: "subscriptions", type: "expense", date: subDays(12) },
    { desc: "Padaria", amount: 15.50, cat: "food", type: "expense", date: subDays(0) }, // Today
    { desc: "Aluguel", amount: 1800.00, cat: "home", type: "expense", date: subDays(15) },
    { desc: "Presente Aniversário", amount: 150.00, cat: "others_expense", type: "expense", date: subDays(18) },
    { desc: "Reembolso", amount: 80.00, cat: "others_income", type: "income", date: subDays(2) },
  ];

  sampleData.forEach((item, index) => {
    transactions.push({
      id: `t-${index}`,
      amount: item.amount,
      description: item.desc,
      categoryId: item.cat,
      date: item.date,
      type: item.type as TransactionType,
    });
  });

  return transactions;
};

export const INITIAL_TRANSACTIONS = generateTransactions();

export const getCategory = (id: string) => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
