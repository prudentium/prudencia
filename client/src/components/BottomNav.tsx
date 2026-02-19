import { Link, useLocation } from "wouter";
import { Home, List, PieChart, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onOpenNewTransaction: () => void;
}

export function BottomNav({ onOpenNewTransaction }: BottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/transactions", icon: List, label: "Lista" },
    { href: "/categories", icon: PieChart, label: "Categorias" },
    { href: "/settings", icon: Settings, label: "Ajustes" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-between h-18 px-4 relative max-w-md mx-auto">
        {navItems.slice(0, 2).map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full space-y-1 cursor-pointer transition-all duration-300",
                  isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground opacity-70"
                )}
              >
                <item.icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Central FAB Placeholder Spacing */}
        <div className="w-16" />

        {navItems.slice(2, 4).map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full space-y-1 cursor-pointer transition-all duration-300",
                  isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground opacity-70"
                )}
              >
                <item.icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Centralized FAB */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Button
            onClick={onOpenNewTransaction}
            size="icon"
            className="h-16 w-16 rounded-full shadow-premium bg-primary hover:bg-primary/95 text-primary-foreground border-4 border-background transition-transform active:scale-90 duration-200"
          >
            <Plus className="w-10 h-10" strokeWidth={3} />
          </Button>
        </div>
      </div>
    </div>
  );
}
