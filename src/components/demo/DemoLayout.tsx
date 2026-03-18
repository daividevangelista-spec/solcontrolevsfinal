import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Sun, LayoutDashboard, Users, FileText, Settings,
  LogOut, Menu, X, Zap, CreditCard, MessageSquare, Shield, Database,
  History, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnimatedBrand } from '@/components/AnimatedBrand';

const demoGroups = [
  {
    label: 'Geral',
    links: [
      { to: '/', label: 'Visão Geral', icon: Sun },
      { to: '/demo/dashboard', label: 'Início', icon: LayoutDashboard },
      { to: '/demo/faturas', label: 'Faturas', icon: FileText },
      { to: '#', label: 'Pagamento', icon: CreditCard },
      { to: '#', label: 'Relatórios', icon: BarChart3 },
    ]
  },
  {
    label: 'Operação',
    links: [
      { to: '/demo/clientes', label: 'Clientes', icon: Users },
      { to: '#', label: 'Unidades', icon: Zap },
      { to: '#', label: 'Whats', icon: MessageSquare },
      { to: '#', label: 'Alertas', icon: Sun },
    ]
  },
  {
    label: 'Admin',
    links: [
      { to: '#', label: 'Equipe', icon: Shield },
      { to: '#', label: 'Central', icon: Database },
      { to: '#', label: 'Histórico', icon: History },
      { to: '#', label: 'Ajustes', icon: Settings },
    ]
  }
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkClick = (to: string) => {
    if (to === '#') {
      import('sonner').then(({ toast }) => {
        toast.info("Recurso Exclusivo da Versão Pro 💎", {
          description: "Esta ferramenta está disponível apenas no plano completo. Fale com um especialista para ativar!",
          action: {
            label: "Saber Mais",
            onClick: () => window.open('https://wa.me/5565999005727?text=Quero%20saber%20mais%20sobre%20os%20recursos%20premium', '_blank')
          }
        });
      });
      return;
    }
    navigate(to);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/30">
      {/* Demo Sidebar */}
      <aside className="hidden md:flex flex-col w-56 h-screen sticky top-0 bg-background/40 backdrop-blur-3xl border-r border-border p-4 z-50">
        <Link to="/" className="flex items-center gap-3 px-3 py-4 mb-2 border-b border-white/5 hover:bg-white/5 transition-colors rounded-xl group/logo">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover/logo:scale-110 transition-transform">
            <Sun className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col">
            <AnimatedBrand size="xs" className="uppercase tracking-tight" as="span" />
            <span className="text-[9px] font-black tracking-widest text-primary/60 uppercase">Modo Demo</span>
          </div>
        </Link>

        <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg mb-3">
          <p className="text-[9px] font-black text-primary uppercase text-center leading-tight">
            Ambiente de Demonstração Interativo
          </p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-1 hide-scrollbar py-1">
         {demoGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <h2 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 px-3 mb-2">{group.label}</h2>
              {group.links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Button
                    key={link.label}
                    variant="ghost"
                    onClick={() => handleLinkClick(link.to)}
                    className={`w-full justify-start h-8 px-2.5 rounded-lg transition-all duration-300 relative group ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]' 
                        : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabDemo"
                        className="absolute left-0 w-1 h-4 bg-primary rounded-full shadow-[0_0_10px_rgb(245,158,11)]"
                      />
                    )}
                    <link.icon className={`w-3.5 h-3.5 mr-2 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary/60'}`} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{link.label}</span>
                  </Button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40">Visual</span>
            <ThemeToggle />
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="w-full justify-start h-8 px-2.5 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            <span className="text-[9px] font-black uppercase tracking-wider">Sair da Demo</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="md:hidden sticky top-0 z-50 h-16 bg-background/40 backdrop-blur-3xl border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <AnimatedBrand size="sm" as="span" />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl bg-white/5">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 relative overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Sales Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Zap className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-black tracking-tight text-foreground uppercase">SIMULADOR EM TEMPO REAL</h2>
                  <p className="text-sm font-medium text-muted-foreground italic">Automatize faturas e receba via WhatsApp sem esforço ☀️</p>
                </div>
              </div>
              <Button onClick={() => window.open('https://wa.me/5565999005727?text=Olá,%20quero%20o%20SolControle', '_blank')} className="saas-button premium-gradient text-white h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] relative z-10">
                Falar com Especialista
              </Button>
            </div>
            
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-3xl md:hidden p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <AnimatedBrand size="md" to="/" onClick={() => setMenuOpen(false)} />
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                <X className="w-8 h-8" />
              </Button>
            </div>
            <nav className="flex-1 space-y-8 overflow-y-auto">
              {demoGroups.map(group => (
                <div key={group.label} className="space-y-3">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 px-2">{group.label}</h2>
                  {group.links.map(link => (
                    <Button
                      key={link.label}
                      variant="ghost"
                      className="w-full justify-start h-14 px-4 rounded-xl text-lg font-black uppercase tracking-tighter text-muted-foreground"
                      onClick={() => handleLinkClick(link.to)}
                    >
                      <link.icon className="w-6 h-6 mr-6" />
                      {link.label}
                    </Button>
                  ))}
                </div>
              ))}
            </nav>
            <Button onClick={() => navigate('/')} variant="destructive" className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs">Encerrar Demo</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
