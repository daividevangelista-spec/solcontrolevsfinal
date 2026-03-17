import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sun, ArrowRight, ShieldCheck, Zap, MessageSquare, 
  CheckCircle2, TrendingUp, Users, Shield, PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function DemoLoginPage() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadPhone, setLeadPhone] = useState("");
  const navigate = useNavigate();

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadPhone.length < 8) return toast.error("WhatsApp inválido");
    
    // Standard Double-Channel Lead Trigger
    const message = `Olá, vi a demonstração do SolControle e gostaria de ativar minha conta.\n\nWhatsApp para contato: ${leadPhone}`;
    const subject = encodeURIComponent("Novo Lead Interessado - SolControle Demo");
    const body = encodeURIComponent(message);
    
    // 1. WhatsApp
    window.open(`https://wa.me/5565999005727?text=${body}`, '_blank');
    
    // 2. Email
    window.location.href = `mailto:solcontrole7@gmail.com?subject=${subject}&body=${body}`;

    toast.success("Iniciando sua experiência SolControle...");
    setTimeout(() => navigate("/demo/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Header/Nav */}
      <nav className="h-20 border-b border-white/5 backdrop-blur-3xl sticky top-0 z-[100] px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl premium-gradient flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-black text-xl tracking-tighter">SolControle</span>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <Button onClick={() => setShowLeadModal(true)} className="relative h-10 px-6 rounded-2xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/60 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 animate-pulse" />
            Área do Cliente
            <span className="ml-1 px-1.5 py-0.5 bg-primary rounded-full text-[7px] text-white font-black uppercase">Demo</span>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 max-w-7xl mx-auto relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Novo: Automação via WhatsApp Platinum</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Automatize suas cobranças <br className="hidden md:block" />
            <span className="text-primary italic">sem esforço.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            Envie faturas, cobre inadimplentes e receba via WhatsApp automaticamente. 
            O sistema de gestão solar mais inteligente do Brasil.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button onClick={() => setShowLeadModal(true)} className="h-16 px-12 rounded-2xl solar-gradient text-white font-black text-lg shadow-[0_20px_50px_-10px_rgba(245,158,11,0.5)] hover:scale-105 transition-all w-full sm:w-auto uppercase tracking-widest">
              🚀 Testar Demonstração
            </Button>
            <Button onClick={() => window.open('https://wa.me/5565999005727?text=Olá,%20quero%20o%20SolControle', '_blank')} variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md font-black text-lg hover:bg-white/10 transition-all w-full sm:w-auto uppercase tracking-widest">
             💬 Falar no WhatsApp
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-20 bg-zinc-900/40 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <h3 className="text-5xl font-display font-black text-primary">+1.200</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Cobranças Automatizadas</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-5xl font-display font-black text-foreground">R$ 500k+</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Valores Gerenciados</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-5xl font-display font-black text-emerald-500">97%</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Taxa de Entrega WhatsApp</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter mb-8 uppercase leading-tight">
            Foco total em <span className="text-primary italic">Resultados.</span>
          </h2>
          <div className="space-y-8">
            {[
              { title: "Pare de cobrar manualmente", desc: "Nossa IA faz todo o trabalho duro de contato via WhatsApp e E-mail.", icon: Zap },
              { title: "Receba 40% mais rápido", desc: "Facilite o pagamento para seu cliente com links diretos e lembretes amigáveis.", icon: TrendingUp },
              { title: "Reduza Inadimplência", desc: "Réguas de cobrança automáticas que não deixam nada passar batido.", icon: MessageSquare },
              { title: "Tudo em um só lugar", desc: "Gestão de unidades, clientes e faturas em um painel premium v16.", icon: Shield },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{benefit.title}</h4>
                  <p className="text-muted-foreground font-medium">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Mockup/Video Simulation Placeholder */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-30" />
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card border-white/20 p-8 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
          >
             <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
             </div>
             <div className="space-y-4">
                <div className="h-4 w-[60%] bg-white/5 rounded-full" />
                <div className="h-20 w-full bg-white/5 rounded-[2rem] flex items-center px-6 gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/20" />
                   <div className="flex-1 space-y-2">
                      <div className="h-2 w-32 bg-white/10 rounded-full" />
                      <div className="h-2 w-full bg-white/5 rounded-full" />
                   </div>
                </div>
                <div className="h-32 w-full bg-white/5 rounded-[2rem] p-6">
                   <p className="text-[10px] font-black uppercase text-primary mb-3 tracking-widest">Simulação WhatsApp:</p>
                   <div className="bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-xl">
                    <p className="text-[11px] font-medium text-emerald-100/70 italic">
                      "Olá João, sua fatura de R$ 400 vence hoje..."
                    </p>
                   </div>
                </div>
             </div>
             <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" />
                   ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Utilizado por +150 usinas</span>
             </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 text-center bg-zinc-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[150px] -mr-48 -mt-48" />
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           className="relative z-10 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter mb-8 uppercase leading-tight">
             Comece agora e <span className="text-primary">automatize</span> sua <br />gestão de energia solar.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Button onClick={() => setShowLeadModal(true)} className="h-20 px-16 rounded-[2rem] solar-gradient text-white font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all w-full sm:w-auto uppercase tracking-widest">
               🚀 Quero usar o SolControle
             </Button>
          </div>
          <p className="mt-8 text-sm font-medium text-muted-foreground italic">
            "Vagas limitadas para novos clientes este mês"
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">
           SolControle Platinum v16.4 © 2026 - Gestão Profissional de Energia Solar
         </p>
      </footer>

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
                <Sun className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-display font-black tracking-tighter text-center mb-2 uppercase">Acessar Demonstração</h3>
              <p className="text-sm text-center text-muted-foreground mb-8 font-medium italic">
                 Explore o sistema v16.4 agora mesmo e veja o futuro da gestão solar.
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
                <Button type="submit" className="w-full h-16 premium-gradient text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm group shadow-xl shadow-primary/20">
                   🚀 Entrar Agora
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                   <ShieldCheck className="w-3 h-3 text-primary/40" /> Ambiente Seguro e Isolado
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
