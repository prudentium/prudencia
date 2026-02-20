import { useState } from "react";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup";
const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "yahoo.com",
]);

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const normalizedEmail = normalizeEmail(email);
    const emailDomain = normalizedEmail.split("@")[1] ?? "";

    if (isSignup && !EMAIL_FORMAT_REGEX.test(normalizedEmail)) {
      toast({
        title: "E-mail inválido",
        description: "Use um e-mail válido no formato nome@provedor.com.",
        variant: "destructive",
      });
      return;
    }

    if (isSignup && !ALLOWED_EMAIL_DOMAINS.has(emailDomain)) {
      toast({
        title: "Provedor não permitido",
        description: "Use um e-mail pessoal (Gmail, Outlook, iCloud e similares).",
        variant: "destructive",
      });
      return;
    }

    if (isSignup && /\s/.test(password)) {
      toast({
        title: "Senha inválida",
        description: "A senha não pode conter espaços.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Cadastro realizado",
          description: "Conta criada com sucesso. Se necessário, confirme seu e-mail.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!",
        });
      }
    } catch (error) {
      toast({
        title: isSignup ? "Falha ao cadastrar" : "Falha no login",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-10">
      <div className="max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-violet-600 p-6 shadow-lg">
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5" />

          <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Prudência</p>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">Controle suas finanças</h1>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            Faça login para acessar seus dados de qualquer dispositivo.
          </p>
        </div>

        <Card className="mt-4 border-none shadow-soft rounded-3xl overflow-hidden">
          <CardContent className="p-5">
            <div className="bg-secondary/60 rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 mb-5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "h-10 rounded-xl text-sm font-bold transition-all",
                  mode === "login"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "h-10 rounded-xl text-sm font-bold transition-all",
                  mode === "signup"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                Cadastro
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Nome</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="h-12 rounded-xl pl-9 bg-secondary/40 border-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">E-mail</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    required
                    className="h-12 rounded-xl pl-9 bg-secondary/40 border-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Senha</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="h-12 rounded-xl pl-9 bg-secondary/40 border-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-sm font-bold gap-2"
              >
                {isSubmitting ? "Processando..." : isSignup ? "Criar conta" : "Entrar"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
