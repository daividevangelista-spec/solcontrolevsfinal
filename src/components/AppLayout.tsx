import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Sun, Menu, X, LogOut, LayoutDashboard, Users, Zap, Settings, 
  FileText, CreditCard, Shield, History, Database, MessageSquare, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
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
      { to: '/admin', label: 'Início', icon: LayoutDashboard },
      { to: '/admin/bills', label: 'Faturas', icon: FileText },
      { to: '/admin/payments', label: 'Pgto', icon: CreditCard },
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
  { to: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { to: '/dashboard/bills', label: 'Faturas', icon: FileText },
  { to: '/dashboard/payments', label: 'Extrato', icon: History },
  { to: '/dashboard/settings', label: 'Perfil', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header - Ultra Compact */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-12 md:h-14 lg:h-14">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all active:scale-95 shrink-0">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg premium-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Sun className="w-4 h-4 md:w-5 md:h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-sm md:text-lg tracking-tight leading-none">SolControle</span>
              <span className="hidden md:block text-[7px] font-bold uppercase tracking-[0.2em] text-primary/80 leading-none mt-0.5">Gestão Solar</span>
            </div>
          </Link>

          {/* Desktop nav - Ultra Compact */}
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/20">
                {adminGroups.map((group, idx) => (
                  <DropdownMenu key={idx}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 rounded-md text-[10px] uppercase tracking-wider font-black transition-all gap-1 ${
                          group.links.some(l => location.pathname === l.to)
                            ? 'bg-card text-primary shadow-sm ring-1 ring-border/30'
                            : 'text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {group.label}
                        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px] rounded-xl border-border/50 shadow-2xl p-1 backdrop-blur-lg">
                      {group.links.map(link => (
                        <DropdownMenuItem key={link.to} asChild className="rounded-lg">
                          <Link 
                            to={link.to} 
                            className={`flex items-center gap-3 p-2 font-bold text-[11px] ${location.pathname === link.to ? 'text-primary bg-primary/5' : 'text-muted-foreground/80 hover:text-foreground'}`}
                          >
                            <link.icon className={`w-3.5 h-3.5 ${location.pathname === link.to ? 'text-primary' : 'opacity-50'}`} />
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
                {clientLinks.map(link => (
                  <Button
                    key={link.to}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 rounded-lg text-[10px] font-black uppercase transition-all duration-300 ${
                      location.pathname === link.to 
                        ? 'bg-card text-primary shadow-sm ring-1 ring-border/20' 
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Link to={link.to}>
                      <link.icon className="w-3.5 h-3.5 mr-2" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 border-l border-border/40 ml-1 pl-1.5">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={signOut} 
                className="rounded-lg h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-border/20 hover:border-destructive/30"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </nav>

          {/* Mobile hamburger */}
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile menu - Condensada */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-2xl p-4 pb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Navegação</span>
              <ThemeToggle />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {isAdmin ? adminGroups.map(group => (
                <div key={group.label} className="space-y-1">
                  <h4 className="px-3 text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">{group.label}</h4>
                  <div className="grid gap-0.5">
                    {group.links.map(link => (
                      <Button
                        key={link.to}
                        asChild
                        variant="ghost"
                        className={`w-full justify-start h-11 px-3 rounded-lg transition-all ${
                          location.pathname === link.to 
                            ? 'bg-primary/5 text-primary border border-primary/20 font-black' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Link to={link.to} onClick={() => setMenuOpen(false)}>
                          <link.icon className={`w-4 h-4 mr-4 ${location.pathname === link.to ? 'text-primary' : 'opacity-40'}`} />
                          <span className="text-[11px] font-black uppercase tracking-tight">{link.label}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="grid gap-1">
                  {clientLinks.map(link => (
                    <Button
                      key={link.to}
                      asChild
                      variant="ghost"
                      className={`w-full justify-start h-12 px-4 rounded-xl transition-all ${
                        location.pathname === link.to 
                          ? 'bg-primary/5 text-primary border border-primary/20 font-black' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <Link to={link.to} onClick={() => setMenuOpen(false)}>
                        <link.icon className="w-5 h-5 mr-4" />
                        <span className="text-xs font-black uppercase tracking-wide">{link.label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-border/40">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-11 px-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-black text-[11px] uppercase" 
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-4" />
                Sair da Conta
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Content - Compact Layout */}
      <main className="container py-4 md:py-6">{children}</main>
    </div>
  );
}
