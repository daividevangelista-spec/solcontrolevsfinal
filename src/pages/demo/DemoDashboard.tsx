import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Users, DollarSign, Zap, 
  ArrowUpRight, ArrowDownRight, Activity, Calendar,
  CheckCircle, Clock, AlertTriangle, FileText, BarChart3,
  Check, X, MessageSquare, Shield, Sun
} from "lucide-react";
import { demoKPIs, demoChartData, demoHistory } from "@/data/demoData";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';
import { Button } from "@/components/ui/button";
import { DashboardHero } from "@/components/DashboardHero";
import { RefinedStat } from "@/components/RefinedStat";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { useState } from "react";
import { toast } from "sonner";

export default function DemoDashboard() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadPhone, setLeadPhone] = useState("");

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadPhone.length < 8) return toast.error("Por favor, digite um WhatsApp válido");
    
    // Lead Payload
    const message = `Olá, estou na demonstração do SolControle e gostaria de ativar a versão PRO.\n\nWhatsApp: ${leadPhone}`;
    const subject = encodeURIComponent("Ativação de Conta Pro - SolControle");
    const body = encodeURIComponent(message);
    
    // Channel 1: WhatsApp
    window.open(`https://wa.me/5565999005727?text=${body}`, '_blank');
    
    // Channel 2: Email
    window.location.href = `mailto:solcontrole7@gmail.com?subject=${subject}&body=${body}`;

    toast.success("🚀 Solicitação enviada via WhatsApp e E-mail!");
    setShowLeadModal(false);
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in relative">
      <DashboardHero 
        highlights={[
          { label: 'Recebido (Demo)', value: `R$ ${demoKPIs.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign },
          { label: 'Faturado (Demo)', value: `R$ ${demoKPIs.totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp },
          { label: 'Vencido (Demo)', value: `R$ ${demoKPIs.totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: AlertTriangle },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-2xl font-display font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
            <Activity className="w-6 h-6 text-primary" />
            Visão Geral Simulada
          </h2>
          <p className="text-muted-foreground text-sm font-medium italic">Dados fictícios para demonstração comercial.</p>
        </div>
        <Button onClick={() => setShowLeadModal(true)} className="saas-button premium-gradient text-white h-12 px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
          🚀 Quero Usar o SolControle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <RefinedStat label="Clientes" value={demoKPIs.clientesAtivos} icon={Users} color="text-info" delay={1} />
          <RefinedStat label="Unidades" value={42} icon={Zap} color="text-warning" delay={2} />
          <RefinedStat label="Total Faturas" value={demoKPIs.clientesAtivos * 3} icon={FileText} color="text-foreground" delay={3} />
          <RefinedStat label="Pendentes" value={demoKPIs.totalPendente / 400} icon={Clock} color="text-warning" delay={4} />
          <RefinedStat label="Pagas" value={28} icon={CheckCircle} color="text-success" delay={5} />
          <RefinedStat label="Vencidas" value={demoKPIs.overdueClients} icon={AlertTriangle} color="text-destructive" delay={6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Revenue Chart */}
           <div className="glass-card border-white/10 dark:border-white/5 p-8 rounded-[2.5rem] solar-border-glow shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-8 border-b border-white/5 pb-4 flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-primary" /> Performance Financeira (Mock)
             </h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={demoChartData}>
                    <defs>
                      <linearGradient id="colorRevDemo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '12px', fontWeight: 900 }} />
                    <Area type="monotone" dataKey="solarRevenue" stroke="hsl(var(--primary))" strokeWidth={4} fill="url(#colorRevDemo)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card border-white/10 p-6 rounded-[2rem] shadow-xl">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4">Gatilho de Conversão</h4>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                       <Zap className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-foreground">+R$ 12.450 Gerenciados</p>
                       <p className="text-[10px] font-medium text-muted-foreground">97% Taxa de entrega no WhatsApp</p>
                    </div>
                 </div>
              </div>
              <div className="glass-card border-white/10 p-6 rounded-[2rem] shadow-xl">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4">Estatísticas Reais</h4>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                       <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-foreground">+1200 Cobranças</p>
                       <p className="text-[10px] font-medium text-muted-foreground">Automatização total da base solar</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
           <ActivityTimeline events={demoHistory} />
           
           <div className="glass-card border-white/10 p-8 rounded-[2.5rem] shadow-2xl bg-zinc-900/40 relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mb-16 -mr-16" />
             <h3 className="text-sm font-display font-black mb-4 uppercase tracking-tighter">SIMULAÇÃO WHATSAPP</h3>
             <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl mb-4 relative">
                <p className="text-xs font-medium text-emerald-200/80 italic">"Olá João, sua fatura de R$ 400 vence dia 30/03. Clique aqui para pagar."</p>
                <div className="flex items-center gap-2 mt-3">
                   <div className="flex -space-x-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <Check className="w-3 h-3 text-emerald-500" />
                   </div>
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Visualizado</span>
                </div>
             </div>
             <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
               Nossa IA identifica o melhor horário para enviar a mensagem e garante que seu cliente receba e visualize.
             </p>
           </div>
        </div>
      </div>

      {/* Floating Lead Capture Button (Pre-footer) */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-[90%] md:max-w-2xl"
      >
        <div className="glass-card border-primary/30 p-4 flex items-center justify-between gap-4 shadow-[0_20px_50px_-10px_rgba(245,158,11,0.3)] bg-background/80 backdrop-blur-3xl rounded-[2rem]">
           <div className="hidden sm:flex items-center gap-3 pl-4">
              <Sun className="w-5 h-5 text-primary animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Vagas limitadas este mês!</span>
           </div>
           <Button onClick={() => setShowLeadModal(true)} className="flex-1 sm:flex-none saas-button premium-gradient text-white h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-sm">
             Ativar Agora
           </Button>
        </div>
      </motion.div>

      {/* WhatsApp Floating Button */}
      <Button 
        onClick={() => window.open('https://wa.me/5565999005727?text=Olá,%20quero%20o%20SolControle', '_blank')}
        className="fixed bottom-10 right-10 z-[100] w-16 h-16 rounded-3xl bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center p-0 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
        <MessageSquare className="w-8 h-8 relative z-10" />
      </Button>

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {showLeadModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeadModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-card border border-white/20 rounded-[3rem] p-10 relative z-10 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl premium-gradient flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-display font-black tracking-tighter text-center mb-2 uppercase">Ativar SolControle</h3>
              <p className="text-sm text-center text-muted-foreground mb-8 font-medium italic">
                Comece agora e automatize sua gestão de energia solar em minutos.
              </p>

              <form onSubmit={handleLeadSubmit} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block px-2 text-center">Digite seu WhatsApp para Iniciar</label>
                   <input 
                      required
                      type="tel"
                      placeholder="(DD) 99999-9999"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-center text-xl font-bold focus:outline-none focus:border-primary/50 transition-all text-foreground"
                   />
                </div>
                <Button type="submit" className="w-full h-16 premium-gradient text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm group">
                   🚀 Ativar Agora
                </Button>
                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-muted-foreground uppercase opacity-40">
                   <Shield className="w-3 h-3" /> Dados 100% Protegidos
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
