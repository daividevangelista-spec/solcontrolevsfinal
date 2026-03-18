import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { demoBills } from "@/data/demoData";
import { 
  FileText, MessageSquare, Mail, CheckCircle2, 
  Send, MoreVertical, Zap, Calendar, Search, 
  ChevronRight, ArrowRight, Check, X, Bell, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DemoBills() {
  const [bills, setBills] = useState(demoBills);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [autoSending, setAutoSending] = useState(false);

  const simulateSend = (id: string, cliente: string, valor: number) => {
    setSelectedBill({ id, cliente, valor });
    setSending(true);
    
    setTimeout(() => {
      setSending(false);
      toast.success(`✔ Cobrança de R$ ${valor} enviada para ${cliente}`);
      setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Pendente' } : b));
    }, 1500);
  };

  const simulateAutoEnvio = () => {
    setAutoSending(true);
    setTimeout(() => {
      setAutoSending(false);
      setShowSimModal(true);
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tighter text-foreground">GESTÃO DE FATURAS</h1>
          <p className="text-muted-foreground font-medium text-sm italic">Simulador de faturamento e cobrança automática</p>
        </div>
        <Button 
          onClick={simulateAutoEnvio}
          disabled={autoSending}
          className="h-14 px-8 solar-gradient text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
        >
          <motion.div 
            animate={autoSending ? { x: ["-100%", "200%"] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-0 left-0 w-1/2 h-full bg-white/20 skew-x-12"
          />
          <Zap className="mr-3 w-5 h-5 fill-white/20" />
          {autoSending ? "SIMULANDO AUTOMAÇÃO..." : "SIMULAR ENVIO AUTOMÁTICO"}
        </Button>
      </header>

      <div className="glass-card border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 bg-white/5 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              readOnly 
              placeholder="Pesquisar faturas..." 
              className="w-full h-11 pl-12 bg-black/40 border border-white/5 rounded-xl text-xs font-bold text-foreground focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground">Filtros</Button>
            <Button variant="outline" className="border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground">Exportar</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 dark:bg-black/20 border-b border-white/5">
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Cliente</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Vencimento</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Solar + Taxas</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Economia</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Total</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Status</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {bills.map((bill) => (
                <tr key={bill.id} className="group hover:bg-muted/20 dark:hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{bill.cliente}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground/40" />
                      <span className="text-xs font-bold text-muted-foreground">{new Date(bill.vencimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-xs font-bold text-muted-foreground">
                    R$ {bill.valorSolar} <span className="mx-1 text-primary">+</span> R$ {bill.taxas}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-emerald-500">- R$ {(bill.valorSolar * 0.4).toFixed(2)}</span>
                      <span className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-wider">SolControle ROI</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-sm font-black text-foreground">R$ {bill.total}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
                      bill.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20' :
                      bill.status === 'Pendente' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20' :
                      'bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button 
                      onClick={() => simulateSend(bill.id, bill.cliente, bill.total)}
                      disabled={sending}
                      variant="ghost" 
                      className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-tight text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20"
                    >
                      <Send className="w-4 h-4 mr-2" /> ENVIAR COBRANÇA
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Card - Redesigned for better contrast and clarity */}
      <div className="bg-muted/30 dark:bg-zinc-900/40 border border-muted dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col lg:flex-row gap-8 items-center justify-between shadow-xl">
        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20 shrink-0">
            <Zap className="w-9 h-9 fill-primary/20" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
               <div className="h-4 w-1 bg-primary rounded-full" />
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Insight Pro Platinum</h4>
            </div>
            <p className="max-w-xl text-base font-semibold leading-relaxed text-foreground/80 dark:text-foreground italic">
              "Personalize suas mensagens com variáveis automáticas como <code className="bg-primary/10 px-2 py-0.5 rounded text-primary font-black">{"{nome_cliente}"}</code>. Isso aumenta a taxa de pagamento em até <span className="text-emerald-500 font-black underline decoration-primary/30 underline-offset-4">40%</span>."
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
          <div className="bg-background/60 dark:bg-black/40 px-8 py-6 rounded-3xl border border-muted dark:border-white/5 text-center shadow-lg group hover:border-primary/30 transition-all">
            <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Visualizações</span>
            <span className="text-2xl font-black text-foreground tabular-nums">85%</span>
          </div>
          <div className="bg-background/60 dark:bg-black/40 px-8 py-6 rounded-3xl border border-muted dark:border-white/5 text-center shadow-lg group hover:border-emerald-500/30 transition-all">
            <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Engajamento</span>
            <span className="text-2xl font-black text-emerald-500 tabular-nums">92%</span>
          </div>
        </div>
      </div>

      {/* Auto-Send Simulation Result Modal */}
      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass-card border border-white/20 rounded-[3rem] p-10 relative z-10 shadow-[0_0_100px_rgba(245,158,11,0.2)]"
            >
              <div className="w-20 h-20 rounded-3xl premium-gradient flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
                <Zap className="w-12 h-12 text-white animate-pulse" />
              </div>
              
              <h3 className="text-3xl font-display font-black tracking-tighter text-center mb-6 text-foreground">SUCESSO NA AUTOMAÇÃO</h3>
              
              <div className="space-y-4 mb-10">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">3 cobranças enviadas</span>
                    <p className="text-[10px] font-bold text-muted-foreground">Disparadas via WhatsApp e E-mail</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">2 clientes visualizaram</span>
                    <p className="text-[10px] font-bold text-muted-foreground">Notificação de leitura confirmada</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">1 pagamento recebido</span>
                    <p className="text-[10px] font-bold text-muted-foreground">PIX conciliado automaticamente</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/50 p-6 rounded-3xl border border-white/5 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">Preview da Mensagem Enviada:</p>
                <div className="bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-xl">
                    <p className="text-xs font-medium text-emerald-100 italic">
                      "Olá João Energia Solar, sua fatura de R$ 400 vence em 30/03. Aproveite o desconto para pagamento antecipado!"
                    </p>
                </div>
              </div>

              <Button 
                onClick={() => setShowSimModal(false)}
                className="w-full h-16 bg-white text-black font-black rounded-2xl text-lg hover:bg-zinc-200 transition-colors uppercase tracking-widest"
              >
                ENTENDI
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
