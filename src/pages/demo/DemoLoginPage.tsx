import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sun, ArrowRight, ShieldCheck, Zap, MessageSquare, 
  CheckCircle2, TrendingUp, Users, Shield, PlayCircle,
  Smartphone, BarChart3, Clock, Rocket, Lock,
  ChevronRight, LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AnimatedBrand } from "@/components/AnimatedBrand";

export default function DemoLoginPage() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadPhone, setLeadPhone] = useState("");
  const navigate = useNavigate();

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadPhone.length < 8) return toast.error("WhatsApp inválido");
    
    const message = `Olá, vim da Demo Platinum e quero ativar meu SolControle agora.\n\nWhatsApp: ${leadPhone}`;
    const subject = encodeURIComponent("Lead Platinum v16 - SolControle");
    const body = encodeURIComponent(message);
    
    window.open(`https://wa.me/5565999005727?text=${body}`, '_blank');
    
    toast.success("Preparando seu ambiente Platinum...");
    setTimeout(() => navigate("/demo/dashboard"), 1200);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-primary/30 font-sans">
      {/* Dynamic Solar Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[180px] rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150" />
      </div>

      {/* Navigation */}
      <nav className="h-24 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-[100] px-8 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] solar-gradient flex items-center justify-center shadow-2xl shadow-primary/20">
            <Sun className="w-7 h-7 text-white" />
          </div>
          <AnimatedBrand size="md" className="tracking-tighter" />
        </div>
        <Button 
          onClick={() => setShowLeadModal(true)} 
          className="h-12 px-8 rounded-2xl bg-white/5 border border-white/20 hover:bg-white/10 hover:border-primary/50 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 group"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Acessar Dashboard Demo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </nav>

      <main className="relative z-10">
        {/* Floating Badge Hero */}
        <section className="pt-28 pb-16 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-6 py-2.5 rounded-full mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.15)]"
          >
            <Zap className="w-4 h-4 text-primary fill-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary-foreground/90">
              Automação via WhatsApp Platinum
            </span>
          </motion.div>

          {/* High-Contrast Hero Title */}
          <h1 className="text-6xl md:text-[9.5rem] font-display font-black tracking-tighter leading-[0.85] mb-10 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl">
            Automatize cobranças <br className="hidden lg:block" />
            <span className="text-primary italic relative">
              sem esforço.
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                className="absolute bottom-4 left-0 h-4 bg-primary/20 -z-10"
              />
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-16 font-medium leading-relaxed px-4">
            Envie faturas, cobre inadimplentes e receba via WhatsApp automaticamente. 
            O sistema de gestão solar mais inteligente do Brasil, agora na versão <span className="text-white font-bold underline decoration-primary decoration-4 underline-offset-4">Platinum v16.4</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 px-6">
            <Button 
              onClick={() => setShowLeadModal(true)} 
              className="h-20 px-14 rounded-[2.25rem] solar-gradient text-white font-black text-xl shadow-[0_30px_60px_-15px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto uppercase tracking-widest group"
            >
              🚀 Iniciar Teste Grátis
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              onClick={() => window.open('https://wa.me/5565999005727', '_blank')} 
              variant="outline" 
              className="h-20 px-12 rounded-[2.25rem] border-white/20 bg-white/5 backdrop-blur-xl font-black text-xl hover:bg-white/10 hover:border-white/40 transition-all w-full sm:w-auto uppercase tracking-widest"
            >
              💬 Falar com Especialista
            </Button>
          </div>
        </section>

        {/* Improved Social Proof Stats */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-primary/5 -skew-y-3 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              { label: "Cobranças Automatizadas", value: "+1.200", color: "text-primary", icon: BarChart3 },
              { label: "Valores Gerenciados", value: "R$ 500k+", color: "text-white", icon: TrendingUp },
              { label: "Taxa de Entrega WhatsApp", value: "97%", color: "text-emerald-500", icon: Smartphone }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-zinc-900/60 border border-white/5 backdrop-blur-2xl text-center group hover:border-primary/30 transition-all hover:-translate-y-2 shadow-2xl"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:solar-gradient group-hover:text-white transition-all`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <h3 className={`text-6xl font-display font-black mb-2 ${stat.color}`}>{stat.value}</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Grid with Platinum Finish */}
        <section className="py-32 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
              Foco total em <br />
              <span className="text-primary italic underline decoration-white/10 decoration-8">Resultados.</span>
            </h2>
            <div className="grid gap-8">
              {[
                { title: "Pare de cobrar manualmente", desc: "Nossa IA faz todo o trabalho duro de contato via WhatsApp e E-mail.", icon: Clock },
                { title: "Receba 40% mais rápido", desc: "Facilite o pagamento para seu cliente com links diretos e lembretes amigáveis.", icon: Zap },
                { title: "Reduza Inadimplência", desc: "Réguas de cobrança automáticas que não deixam nada passar batido.", icon: ShieldCheck },
                { title: "Tudo em um só lugar", desc: "Gestão de unidades, clientes e faturas em um painel premium v16.", icon: LayoutDashboard },
              ].map((benefit, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-8 group p-6 rounded-3xl hover:bg-white/5 transition-all cursor-default"
                >
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 group-hover:solar-gradient group-hover:border-transparent transition-all duration-500 shadow-xl">
                    <benefit.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black group-hover:text-primary transition-colors">{benefit.title}</h4>
                    <p className="text-white/50 font-medium leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Premium WhatsApp Simulation Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-card border-white/10 p-1 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(245,158,11,0.2)] relative z-10 overflow-hidden"
            >
              <div className="bg-[#0c0c0c] rounded-[3.4rem] p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black uppercase text-white">Visualização Mobile</h5>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">● Online Agora</span>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-white/20" />
                </div>

                <div className="space-y-8">
                  {/* Fake Contact Message */}
                  <div className="max-w-[85%] bg-white/5 p-5 rounded-[2rem] rounded-tl-none border border-white/5">
                     <p className="text-xs font-black text-primary mb-2 uppercase tracking-widest">Simulação WhatsApp:</p>
                     <div className="space-y-3">
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                          <p className="text-sm leading-relaxed text-emerald-50/90 font-medium italic">
                            "Olá João, aqui é do suporte SolControle. Identificamos que sua fatura de R$ 412,50 vence hoje. Gostaria de receber o link PIX?"
                          </p>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[9px] font-bold text-white/30 uppercase">10:45 AM</span>
                          <div className="flex -space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          </div>
                        </div>
                     </div>
                  </div>

                  {/* Profile Context */}
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex -space-x-3">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0c0c0c] bg-zinc-800" />
                       ))}
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/40">Utilizado por +150 usinas</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* High-Impact Final CTA */}
        <section className="py-40 px-6 text-center relative overflow-hidden bg-black">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-primary/10 blur-[200px] rounded-full opacity-30" />
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="relative z-10 max-w-5xl mx-auto space-y-12"
          >
            <h2 className="text-5xl md:text-[9rem] font-display font-black tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
               Comece hoje e <br />
               <span className="solar-gradient-text italic underline decoration-primary/20 decoration-[16px]">automatize tudo.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
               <Button onClick={() => setShowLeadModal(true)} className="h-24 px-16 rounded-[2.5rem] solar-gradient text-white font-black text-2xl shadow-[0_40px_80px_-20px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto uppercase tracking-widest flex items-center gap-4">
                 🚀 Quero o SolControle Platinum
                 <ArrowRight className="w-8 h-8" />
               </Button>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-white/40 flex items-center justify-center gap-3 italic">
                <Rocket className="w-5 h-5 text-primary" />
                "Vagas limitadas para novos clientes este mês"
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-black/40 text-center relative z-10">
         <div className="flex items-center justify-center gap-3 mb-6 opacity-30 grayscale contrast-200">
           <Sun className="w-6 h-6" />
           <AnimatedBrand size="xs" as="span" />
         </div>
         <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">
           SolControle Platinum v16.4 © 2026 - Gestão Profissional de Energia Solar
         </p>
      </footer>

      {/* Lead Capture Modal - Re-styled for High Definition */}
      <AnimatePresence>
        {showLeadModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeadModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-lg bg-[#0c0c0c] border border-white/10 rounded-[4rem] p-8 md:p-12 relative z-10 shadow-[0_100px_100px_-50px_rgba(245,158,11,0.4)]"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2.5rem] solar-gradient flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 rotate-3">
                <Sun className="w-10 h-10 md:w-14 md:h-14 text-white animate-spin-slow" />
              </div>
              <h3 className="text-3xl md:text-4xl font-display font-black tracking-tighter text-center mb-4 uppercase text-white">Acesso Exclusivo</h3>
              <p className="text-sm md:text-base text-center text-white/40 mb-10 font-medium italic leading-relaxed">
                 O futuro da gestão solar está a um clique de distância. <br />
                 Versão <span className="text-primary font-bold">Platinum v16.4</span> liberada para teste.
              </p>

              <form onSubmit={handleLeadSubmit} className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-2 block px-2 text-center">Informe seu WhatsApp</label>
                   <div className="relative group">
                      <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-primary transition-colors" />
                      <input 
                        required
                        type="tel"
                        placeholder="(DD) 99999-9999"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        className="w-full h-20 bg-white/5 border border-white/10 rounded-3xl pl-16 pr-6 text-center text-2xl font-black focus:outline-none focus:border-primary/50 transition-all text-white shadow-inner"
                      />
                   </div>
                </div>
                <Button type="submit" className="w-full h-20 solar-gradient text-white rounded-[2rem] font-black uppercase tracking-widest text-sm md:text-base group shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all px-4">
                   🚀 Entrar no Dashboard Platinum
                </Button>
                <div className="flex items-center justify-center gap-3 text-[11px] font-black text-white/20 uppercase tracking-[0.2em]">
                   <ShieldCheck className="w-4 h-4 text-emerald-500/40" /> 
                   Fim da Cobrança Manual
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
