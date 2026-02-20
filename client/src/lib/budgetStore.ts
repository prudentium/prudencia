import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const LOCAL_BUDGET_KEY = "monthly_budget";
const DEFAULT_BUDGET = 5000;

export async function loadBudget(): Promise<number> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem(LOCAL_BUDGET_KEY);
    return saved ? Number(saved) : DEFAULT_BUDGET;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("monthly_budget")
    .single();

  if (error || !data) {
    console.error("Erro ao carregar orçamento:", error?.message);
    const saved = localStorage.getItem(LOCAL_BUDGET_KEY);
    return saved ? Number(saved) : DEFAULT_BUDGET;
  }

  return Number(data.monthly_budget);
}

export async function saveBudget(value: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem(LOCAL_BUDGET_KEY, String(value));
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: user.id, monthly_budget: value },
      { onConflict: "user_id" }
    );

  if (error) {
    throw new Error(error.message);
  }
}
