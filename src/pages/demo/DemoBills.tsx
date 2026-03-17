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
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20">
                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Cliente</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Vencimento</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Solar + Taxas</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Economia</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Total</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Status</th>
                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bills.map((bill) => (
                <tr key={bill.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{bill.cliente}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/40" />
                      <span className="text-xs font-bold text-muted-foreground">{new Date(bill.vencimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-muted-foreground">
                    R$ {bill.valorSolar} <span className="mx-1">+</span> R$ {bill.taxas}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-emerald-500">- R$ {(bill.valorSolar * 0.4).toFixed(2)}</span>
                      <span className="text-[8px] font-black uppercase text-muted-foreground/40">SolControle ROI</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-foreground">R$ {bill.total}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${
                      bill.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      bill.status === 'Pendente' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
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

      {/* Statistics Recap */}
      <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center justify-between shadow-inner">
        <div className="flex gap-6 items-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Dica Platinum</h4>
            <p className="max-w-md text-sm font-bold text-foreground">
              Personalize suas mensagens com variáveis automáticas como <code className="bg-white/5 px-1.5 py-0.5 rounded text-primary">{"{nome_cliente}"}</code> para aumentar a taxa de pagamento em até 40%.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center bg-black/40 px-6 py-4 rounded-2xl border border-white/5 w-32">
            <span className="block text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Visualizações</span>
            <span className="text-lg font-black text-foreground">85%</span>
          </div>
          <div className="text-center bg-black/40 px-6 py-4 rounded-2xl border border-white/5 w-32">
            <span className="block text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Abertura Zap</span>
            <span className="text-lg font-black text-emerald-500">92%</span>
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
