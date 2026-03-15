import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Sun, Menu, X, LogOut, LayoutDashboard, Users, Zap, Settings, 
  FileText, CreditCard, Shield, History, Database, MessageSquare, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminGroups = [
  {
    label: 'Geral',
    links: [
      { to: '/', label: 'Visão Geral', icon: Sun },
      { to: '/admin', label: 'Início', icon: LayoutDashboard },
      { to: '/admin/bills', label: 'Faturas', icon: FileText },
      { to: '/admin/payments', label: 'Pagamento', icon: CreditCard },
    ]
  },
  {
    label: 'Operação',
    links: [
      { to: '/admin/clients', label: 'Clientes', icon: Users },
      { to: '/admin/units', label: 'Unidades', icon: Zap },
      { to: '/admin/whatsapp', label: 'Whats', icon: MessageSquare },
    ]
  },
  {
    label: 'Admin',
    links: [
      { to: '/admin/users', label: 'Equipe', icon: Shield },
      { to: '/admin/management', label: 'Central', icon: Database },
      { to: '/admin/settings', label: 'Ajustes', icon: Settings },
    ]
  }
];

const clientLinks = [
  { to: '/', label: 'Visão Geral', icon: Sun },
  { to: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { to: '/dashboard/bills', label: 'Faturas', icon: FileText },
  { to: '/dashboard/settings', label: 'Perfil', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isStaff = role === 'admin' || role === 'moderator';
  const links = isStaff ? adminGroups.flatMap(g => g.links) : clientLinks;

  return (
    <div className="min-h-screen flex bg-transparent text-foreground selection:bg-primary/30 selection:text-foreground">
      {/* Premium Sidebar (Left) */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-background/40 backdrop-blur-3xl border-r border-white/10 p-5 z-50">
        <Link to={isStaff ? "/admin" : "/dashboard"} className="flex items-center gap-3 px-3 py-6 mb-4 border-b border-white/5 hover:bg-white/5 transition-colors rounded-t-2xl group/logo">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover/logo:scale-110 transition-transform">
            <Sun className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-display font-black tracking-tighter text-foreground">SOLCONTROLE</span>
            <span className="text-[9px] font-black tracking-widest text-primary/60 uppercase">Platinum V16</span>
          </div>
        </Link>

        <nav className="flex-1 space-y-6 overflow-y-auto pr-1 hide-scrollbar">
          {!role ? (
            <div className="space-y-4 px-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-9 w-full bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : isStaff ? (
            adminGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <h2 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 px-3 mb-2">{group.label}</h2>
                {group.links.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Button
                      key={link.to}
                      variant="ghost"
                      onClick={() => navigate(link.to)}
                      className={`w-full justify-start h-9 px-3 rounded-lg transition-all duration-300 relative group ${
                        isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]' 
                          : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute left-0 w-1 h-4 bg-primary rounded-full shadow-[0_0_10px_rgb(245,158,11)]"
                        />
                      )}
                      <link.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary/60'}`} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{link.label}</span>
                    </Button>
                  );
                })}
              </div>
            ))
          ) : (
            clientLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Button
                  key={link.to}
                  variant="ghost"
                  onClick={() => navigate(link.to)}
                  className={`w-full justify-start h-10 px-3 rounded-lg transition-all duration-300 relative group ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]' 
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_rgb(245,158,11)]"
                    />
                  )}
                  <link.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary/60'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{link.label}</span>
                </Button>
              );
            })
          )}
        </nav>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Preferências</span>
            <ThemeToggle />
          </div>
          <Button 
            variant="ghost" 
            onClick={signOut}
            className="w-full justify-start h-10 px-3 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="text-[10px] font-black uppercase tracking-wider">Desconectar</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="md:hidden sticky top-0 z-50 h-16 bg-background/40 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-6">
          <Link to={isStaff ? "/admin" : "/dashboard"} className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-xl premium-gradient flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-lg tracking-tighter">SolControle</span>
          </Link>
         <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl bg-white/5">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </header>

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
                <Link to={isStaff ? "/admin" : "/dashboard"} className="font-display font-black text-2xl tracking-tighter text-primary" onClick={() => setMenuOpen(false)}>SolControle</Link>
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                  <X className="w-8 h-8" />
                </Button>
              </div>
              <nav className="flex-1 space-y-8 overflow-y-auto">
                {isStaff ? (
                  adminGroups.map(group => (
                    <div key={group.label} className="space-y-3">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 px-2">{group.label}</h2>
                      {group.links.map(link => {
                        const isActive = location.pathname === link.to;
                        return (
                          <Button
                            key={link.to}
                            variant="ghost"
                            className={`w-full justify-start h-14 px-4 rounded-xl text-lg font-black uppercase tracking-tighter ${
                              isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground'
                            }`}
                            onClick={() => { navigate(link.to); setMenuOpen(false); }}
                          >
                            <link.icon className="w-6 h-6 mr-6" />
                            {link.label}
                          </Button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  clientLinks.map(link => {
                    const isActive = location.pathname === link.to;
                    return (
                      <Button
                        key={link.to}
                        variant="ghost"
                        className={`w-full justify-start h-16 px-6 rounded-2xl text-xl font-black uppercase tracking-tighter ${
                          isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground'
                        }`}
                        onClick={() => { navigate(link.to); setMenuOpen(false); }}
                      >
                        <link.icon className="w-7 h-7 mr-6" />
                        {link.label}
                      </Button>
                    );
                  })
                )}
              </nav>
              <div className="pt-8 border-t border-white/10 flex items-center justify-between gap-4">
                <Button onClick={signOut} variant="destructive" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs">Sair da Conta</Button>
                <div className="p-2 border border-white/10 rounded-2xl"><ThemeToggle /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 md:p-8 lg:p-10 relative overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
