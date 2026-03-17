import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Sun, ArrowRight, Zap, ShieldCheck, BarChart3, MessageSquare, 
  Leaf, Globe, Wind, CheckCircle2, ChevronRight, TrendingUp, PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { SolarBackground } from "@/components/SolarBackground";

export default function Index() {
  return (
    <div className="min-h-screen text-foreground selection:bg-primary/30 relative">
      <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/20 backdrop-blur-2xl">
        <div className="container h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Sun className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <span className="font-display font-black text-xl tracking-tighter">SolControle</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors hidden sm:block px-4">Entrar</Link>
            <Button className="solar-gradient text-white font-black rounded-xl shadow-xl shadow-primary/20 px-6 h-10 uppercase text-[10px] tracking-widest" asChild>
              <Link to="/login">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-8"
          >
            <Zap className="w-4 h-4 fill-primary/20" /> PLATINUM V16: O FUTURO É SOLAR
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-[0.9] max-w-5xl mx-auto mb-10"
          >
            Sua usina, seu controle, <br />
            <span className="solar-gradient-text">Transparência Total.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Monitore a geração, gerencie faturas e automatize o contato com clientes na plataforma SaaS solar mais avançada do Brasil.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button size="lg" className="h-16 px-10 solar-gradient text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group" asChild>
              <Link to="/login">
                Começar agora <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-primary/20 font-black text-lg hover:bg-primary/5 transition-all w-full sm:w-auto uppercase tracking-widest group" asChild>
              <Link to="/demo">
                <PlayCircle className="mr-3 w-6 h-6 text-primary" /> Testar Demo
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Environment & Tech Section */}
      <section className="py-24 relative">
        <div className="container px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Ecossistema", desc: "Software que respeita o meio ambiente.", icon: Leaf, color: "text-emerald-500" },
              { title: "Escalável", desc: "Pronto para centrais de qualquer tamanho.", icon: Globe, color: "text-blue-500" },
              { title: "Autônomo", desc: "Notificações inteligentes via WhatsApp.", icon: MessageSquare, color: "text-amber-500" },
              { title: "Puro Solar", desc: "Design focado na energia renovável.", icon: Wind, color: "text-sky-500" },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card border-white/10 p-8 rounded-3xl solar-border-glow group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:solar-gradient group-hover:text-white transition-all duration-500 shadow-inner`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Feature Preview */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="container px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter leading-tight">
              Uma experiência <br />
              <span className="solar-gradient-text tracking-tighter">Radicalmente Diferente.</span>
            </h2>
            <div className="space-y-4">
              {[
                "Cálculo automático de injeção e economia",
                "Geração massiva de faturas personalizadas",
                "Integração direta com o WhatsApp para faturamento",
                "Filtros avançados e exportação de relatórios Platinum"
              ].map(item => (
                <div key={item} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl border-primary/20 font-black uppercase text-xs tracking-widest hover:bg-primary/5 group" asChild>
                <Link to="/login">
                  Descobrir Recursos <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" className="h-14 px-8 rounded-xl bg-background border-2 border-dashed border-primary/30 text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5 hover:border-primary/60 transition-all group" asChild>
                <Link to="/demo">
                  <PlayCircle className="mr-2 w-4 h-4 animate-pulse" /> Ver Demo Ao Vivo
                </Link>
              </Button>
            </div>

            {/* Demo Access Highlight Card */}
            <Link to="/demo" className="block group mt-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-5 cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl -mr-8 -mt-8" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5 text-primary group-hover:scale-125 transition-transform" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-70">Área do Cliente — Demo Interativa</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">Testar o painel agora, sem cadastro</p>
                  </div>
                  <ArrowRight className="ml-auto w-4 h-4 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex-1 glass-card border-white/20 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(245,158,11,0.2)] overflow-hidden p-1 relative group"
          >
            <div className="aspect-[16/10] bg-zinc-950 rounded-[2.3rem] overflow-hidden relative border border-white/5">
                {/* Background Premium Mockup Image */}
                <img 
                  src="/solar_dashboard_mockup_v16_1773602413064.png" 
                  alt="SolControle Interface" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3000ms]"
                />
                
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-transparent to-primary/5 pointer-events-none" />

                {/* Browser UI Chrome */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center px-6 gap-2 z-20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                  </div>
                  <div className="ml-4 h-5 w-48 bg-white/5 rounded-full border border-white/5 flex items-center px-3">
                    <div className="w-2 h-2 rounded-full bg-primary/40 mr-2" />
                    <div className="h-2 w-24 bg-white/10 rounded-full" />
                  </div>
                </div>
                
                {/* Floating Dynamic Cards */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Floating Stat 1 */}
                  <motion.div 
                    animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[25%] right-[10%] w-32 h-20 glass-card bg-black/60 border-primary/20 p-3 rounded-2xl z-30 shadow-2xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-emerald-500">+12%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full solar-gradient"
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[20%] left-[10%] w-44 h-28 glass-card bg-black/60 border-primary/10 p-4 rounded-3xl z-30 shadow-2xl flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60 block">Status Geral</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-foreground">750 <span className="text-primary/60">kWh</span></span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 h-8 items-end">
                      {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.5].map((h, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ height: 0 }}
                          animate={{ height: `${h * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="flex-1 bg-gradient-to-t from-primary/10 to-primary/40 rounded-t-[2px]" 
                        />
                      ))}
                    </div>
                  </motion.div>
                  {/* Central Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                </div>

                {/* Decorative Sun Flare */}
                <Sun className="w-48 h-48 text-primary/10 absolute -bottom-10 -right-10 blur-3xl animate-pulse" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>



      {/* NEW: Lead Capture & Demo Trial Cards */}
      <section className="py-24 relative overflow-hidden bg-zinc-900/10">
        <div className="container px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: WhatsApp Lead Capture */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="glass-card border-primary/20 p-10 rounded-[3rem] bg-zinc-950/40 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-display font-black tracking-tight mb-4 uppercase">WhatsApp Especialista</h3>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
              Deixe seu WhatsApp e receba uma demonstração guiada de como o SolControle pode triplicar sua produtividade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="tel" 
                placeholder="(DD) 99999-9999" 
                className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-xl font-bold focus:outline-none focus:border-primary/50 transition-all text-foreground"
              />
              <Button onClick={() => window.open('https://wa.me/5565999005727', '_blank')} className="h-16 px-10 solar-gradient text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-primary/20 min-w-max">
                Me Chamar agora
              </Button>
            </div>
          </motion.div>

          {/* Card 2: Demo Access Invitation */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="glass-card border-white/10 p-10 rounded-[3rem] bg-primary/5 relative overflow-hidden group border-2 border-dashed border-primary/30"
          >
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl -ml-16 -mb-16" />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <PlayCircle className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-3xl font-display font-black tracking-tight mb-4 uppercase text-primary">Demonstração Real</h3>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
              Explore o painel administrativo Platinum agora mesmo. Veja faturas, clientes e automações em tempo real.
            </p>
            <Button className="w-full h-16 bg-foreground text-background hover:bg-foreground/80 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all" asChild>
              <Link to="/demo">Testar Agora Grátis</Link>
            </Button>
          </motion.div>
        </div>
      </section>
      <section className="py-32 text-center">
        <div className="container px-6">
          <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-10">
            Pronto para <span className="solar-gradient-text">Elevar</span> seu negócio?
          </h2>
          <Button size="lg" className="h-20 px-16 solar-gradient text-white font-black text-2xl rounded-[2rem] shadow-[0_0_50px_rgba(245,158,11,0.4)] hover:scale-110 active:scale-95 transition-all" asChild>
            <Link to="/login">INICIAR AGORA</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-background/20 backdrop-blur-md">
        <div className="container px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl solar-gradient flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-xl tracking-tighter">SolControle</span>
          </div>
          
          <div className="text-muted-foreground/60 font-bold text-[10px] uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} SolControle Platinum Edition. Feito para o Brasil.
          </div>
        </div>
      </footer>
    </div>
  );
}
