import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Sun, Wallet, Zap, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface HeroHighlight {
  label: string;
  value: string;
  icon: any;
}

interface DashboardHeroProps {
  highlights?: HeroHighlight[];
}

export function DashboardHero({ highlights }: DashboardHeroProps) {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden premium-gradient rounded-3xl p-8 mb-8 shadow-2xl shadow-primary/30 text-white border border-white/10"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -ml-24 -mb-24" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
            <Sun className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Status do Sistema: Operacional</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black leading-tight">
            {greeting},<br />
            <span className="opacity-80 font-bold">{user?.email?.split('@')[0].split('.')[0].charAt(0).toUpperCase() + user?.email?.split('@')[0].split('.')[0].slice(1) || 'Usuário'}!</span>
          </h1>
          <p className="text-white/70 max-w-md font-medium text-lg leading-relaxed">
            Seja bem-vindo ao seu centro de controle de energia solar. Monitore sua economia e impacto em tempo real.
          </p>
        </div>

        {highlights && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                  <h.icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">{h.label}</p>
                <p className="text-lg font-bold truncate">{h.value}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
