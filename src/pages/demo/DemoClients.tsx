import { demoClients } from "@/data/demoData";
import { Users, Search, MoreVertical, Plus, Zap, UserCheck, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function DemoClients() {
  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tighter text-foreground">CLIENTES SOLAR</h1>
          <p className="text-muted-foreground font-medium text-sm italic">Base de dados simulada para demonstração</p>
        </div>
        <Button className="h-14 px-8 solar-gradient text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-widest">
          <Plus className="mr-2 w-5 h-5" /> Novo Cliente
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card border-white/10 p-6 rounded-[2rem] solar-border-glow shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black text-foreground">3</span>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Contratos Ativos</p>
          </div>
        </div>
        <div className="glass-card border-white/10 p-6 rounded-[2rem] shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black text-foreground">100%</span>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Proteção de Dados</p>
          </div>
        </div>
        <div className="glass-card border-white/10 p-6 rounded-[2rem] shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black text-foreground">Automatizado</span>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Gestão de Injeção</p>
          </div>
        </div>
      </div>

      <div className="glass-card border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 bg-white/5 border-b border-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              readOnly 
              placeholder="Pesquisar clientes demo..." 
              className="w-full h-11 pl-12 bg-black/40 border border-white/5 rounded-xl text-xs font-bold text-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
          <div className="p-0">
            {demoClients.map((client, i) => (
              <motion.div 
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 hover:bg-white/5 transition-all flex items-center justify-between cursor-pointer border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.nome}`} alt={client.nome} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{client.nome}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{client.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                         client.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' :
                         client.status === 'Pendente' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                       }`}>
                         {client.status}
                       </span>
                       <span className="text-[10px] font-bold text-muted-foreground/40">{client.telefone}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
          
          <div className="p-12 flex flex-col items-center justify-center text-center bg-zinc-950/30">
            <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
              <Users className="w-12 h-12 text-primary/40" />
            </div>
            <h4 className="text-xl font-display font-black tracking-tight mb-2 uppercase">Perfil do Cliente</h4>
            <p className="text-sm text-muted-foreground max-w-sm mb-8 font-medium">
              Selecione um cliente na lista ao lado para visualizar o detalhamento técnico, faturas anteriores e unidades vinculadas.
            </p>
            <div className="w-full max-w-xs space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
