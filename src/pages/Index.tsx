import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sun, ArrowRight, Zap, ShieldCheck, BarChart3, MessageSquare } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl solar-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter">SolControle</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-bold text-slate-600" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button className="solar-gradient text-accent font-black rounded-xl shadow-xl shadow-primary/20 px-8" asChild>
              <Link to="/login">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-warning/5 rounded-full blur-3xl opacity-50" />
        
        <div className="container relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest animate-fade-in">
            <Zap className="w-3.5 h-3.5" /> A revolução na gestão de energia solar
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-none max-w-5xl mx-auto">
            O controle total da sua <span className="solar-gradient-text">Energia Solar</span> num só lugar.
          </h1>
          
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Monitore sua geração, gerencie faturas, automatize notificações e maximize sua economia com a plataforma SaaS mais moderna do mercado brasileiro.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button size="lg" className="h-16 px-12 solar-gradient text-accent font-black text-xl rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform" asChild>
              <Link to="/login">
                Acessar Plataforma <ArrowRight className="ml-3 w-6 h-6" />
              </Link>
            </Button>
            <p className="text-slate-400 font-bold">Trusted by 500+ solar plants</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-4xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4">Dashboard Preditivo</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Visualize sua economia real vs. custo da concessionária com transparência absoluta.</p>
            </div>

            <div className="p-8 rounded-4xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4">Gestão de Pagamentos</h3>
              <p className="text-slate-500 font-medium leading-relaxed">PIX Copy & Paste, QR Codes dinâmicos e confirmação automática de comprovantes.</p>
            </div>

            <div className="p-8 rounded-4xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4">WhatsApp Automação</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Envio massivo de faturas e lembretes de vencimento integrados diretamente com a API oficial.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl solar-gradient flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-xl tracking-tighter">SolControle</span>
          </div>
          
          <div className="text-slate-400 font-bold text-sm">
            © {new Date().getFullYear()} SolControle Brasil. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
