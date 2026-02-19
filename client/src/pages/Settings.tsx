import { Moon, Sun, Bell, Shield, Download, ChevronRight, User, PiggyBank, Target, Zap, Cloud, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Settings() {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Seu controle financeiro</h1>
        <p className="text-sm text-muted-foreground">Preferências, metas e dados</p>
      </header>

      {/* Profile Section */}
      <Card className="border-none shadow-soft bg-secondary/30">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-background shadow-md shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="text-base font-bold leading-tight">Jane Doe</h2>
            <p className="text-xs text-muted-foreground truncate">jane.doe@example.com</p>
            <Button variant="link" className="p-0 h-auto text-primary text-xs w-fit mt-0.5">Editar perfil</Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      <div className="space-y-6">
        {/* SEÇÃO A — CONTROLE FINANCEIRO */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Controle Financeiro</h3>
          <Card className="border-none shadow-soft overflow-hidden">
            <div className="divide-y divide-border/40">
              <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Orçamento do mês</span>
                    <span className="text-[10px] text-muted-foreground">R$ 3.500,00 definido</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Meta de economia</span>
                    <span className="text-[10px] text-muted-foreground">R$ 800,00 definido</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Alertas de limite</span>
                    <span className="text-[10px] text-muted-foreground">Avisar em 80% do gasto</span>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </section>

        {/* SEÇÃO B — PREFERÊNCIAS */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Preferências</h3>
          <Card className="border-none shadow-soft overflow-hidden">
            <div className="divide-y divide-border/40">
              <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors opacity-60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                    <Moon className="w-5 h-5 hidden dark:block" />
                    <Sun className="w-5 h-5 block dark:hidden" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Modo escuro</span>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1 leading-none bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">Em breve</Badge>
                  </div>
                </div>
                <Switch disabled />
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors opacity-60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Notificações</span>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1 leading-none bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">Em breve</Badge>
                  </div>
                </div>
                <Switch disabled />
              </div>
            </div>
          </Card>
        </section>

        {/* SEÇÃO C — SEGURANÇA & DADOS */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Segurança & Dados</h3>
          <Card className="border-none shadow-soft overflow-hidden">
            <div className="divide-y divide-border/40">
              <div className="p-4 flex items-center justify-between transition-colors opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Segurança (PIN)</span>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1 leading-none bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Em breve</Badge>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Salvar na nuvem</span>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1 leading-none bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Em breve</Badge>
                  </div>
                </div>
                <Switch disabled />
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold">Exportar CSV</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Funcionalidade disponível em breve</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Card>
        </section>

        <div className="pt-4 flex flex-col items-center gap-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-xs font-semibold gap-2">
            Logout
          </Button>
          <p className="text-center text-[10px] text-muted-foreground font-medium">Versão 1.0.0 (Beta)</p>
        </div>
      </div>
    </div>
  );
}
