import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CalendarDays, UserCircle, Building2, TrendingUp, History } from 'lucide-react';

interface Payment {
  id: string;
  payment_type: string;
  payment_date: string;
  receipt_file_url: string | null;
  energy_bills?: { month: number; year: number; total_amount: number; consumer_units?: { unit_name: string; clients?: { name: string } | null } | null } | null;
}

const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('payments').select('*, energy_bills(month, year, total_amount, consumer_units(unit_name, clients(name)))').order('created_at', { ascending: false });
      setPayments((data as any) || []);
    };
    load();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* SaaS Header */}
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-display font-black tracking-tight">Histórico de Fluxo</h1>
          <p className="text-white/80 font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-warning" />
            Rastro completo de pagamentos e liquidações processadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {payments.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed">
            <History className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground font-medium">Nenhum pagamento registrado no histórico.</p>
          </div>
        )}
        {payments.map(p => (
          <Card key={p.id} className="saas-card group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
            <CardContent className="p-0">
               <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
                  <div className="p-6 flex-1 flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-success/10 text-success group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-lg font-display font-black text-foreground truncate">
                        {p.energy_bills?.consumer_units?.unit_name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground/60">
                         <div className="flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5" />{p.energy_bills?.consumer_units?.clients?.name}</div>
                         <div className="w-1 h-1 rounded-full bg-border" />
                         <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{months[(p.energy_bills?.month || 1) - 1]}/{p.energy_bills?.year}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:w-64 bg-muted/5 flex flex-col justify-center items-end gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-display font-black text-foreground">
                        R$ {Number(p.energy_bills?.total_amount || 0).toFixed(2)}
                      </p>
                      <Badge variant="outline" className="mt-1 bg-background font-black text-[9px] uppercase tracking-widest border-primary/20 text-primary">
                        {p.payment_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">
                      <CalendarDays className="w-3 h-3" />
                      Liquidação: {new Date(p.payment_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
