import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, FileText, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineEvent {
  date: string;
  label: string;
  status: 'paid' | 'pending' | 'overdue' | 'generated';
  amount?: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'paid': return { icon: BadgeCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Paga" };
      case 'pending': return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pendente" };
      case 'overdue': return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Vencida" };
      case 'generated': return { icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", label: "Gerada" };
      default: return { icon: CheckCircle2, color: "text-muted-foreground", bg: "bg-muted/10", label: "Evento" };
    }
  };

  return (
    <Card className="saas-card">
      <CardHeader>
        <CardTitle className="text-lg font-display font-black flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Histórico de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-8">
        <div className="relative space-y-8 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/40">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 italic">Nenhum evento registrado.</p>
          ) : (
            events.map((e, i) => {
              const config = getStatusConfig(e.status);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="relative pl-12 group"
                >
                  <div className={`absolute left-0 top-0 p-2 rounded-xl ${config.bg} ${config.color} border border-white/10 shadow-sm z-10 group-hover:scale-110 transition-transform duration-300`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20 p-4 rounded-2xl border border-border/30 hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{e.date}</p>
                      <h4 className="text-sm font-bold text-foreground leading-tight">{e.label}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {e.amount && <span className="text-xs font-black text-foreground/70">{e.amount}</span>}
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${config.bg} ${config.color} border border-border/20`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
