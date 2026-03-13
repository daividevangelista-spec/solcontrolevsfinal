import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, History, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  payment_type: string;
  payment_date: string;
  energy_bills?: { month: number; year: number; total_amount: number; consumer_units?: { unit_name: string } | null } | null;
}

const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function ClientPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // First get the client ID for this user
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (clientData) {
          const { data } = await supabase.from('payments')
            .select('*, energy_bills!inner(month, year, total_amount, consumer_units!inner(unit_name, client_id))')
            .eq('energy_bills.consumer_units.client_id', clientData.id)
            .order('created_at', { ascending: false });
            
          setPayments((data as any) || []);
        } else {
          setPayments([]);
        }
      } catch (error) {
        console.error('Error loading payments:', error);
        toast.error('Erro ao carregar histórico de pagamentos');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [user]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Carregando pagamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black tracking-tight">Meus Pagamentos</h1>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-warning" />
              Histórico detalhado de todas as transações realizadas
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md shadow-inner text-xs font-black uppercase tracking-widest">
            {payments.length} Pagamentos
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {payments.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
            <History className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Nenhum pagamento registrado.</p>
          </div>
        ) : (
          payments.map(p => (
            <Card key={p.id} className="saas-card overflow-hidden transition-all duration-300 hover:scale-[1.01] border-border/50">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-black text-foreground truncate uppercase text-sm sm:text-base">
                      {p.energy_bills?.consumer_units?.unit_name || 'Unidade Consumidora'}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-bold">
                      Referência: {months[(p.energy_bills?.month || 1) - 1]} / {p.energy_bills?.year}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 px-4 py-3 sm:p-0 bg-muted/20 sm:bg-transparent rounded-2xl sm:rounded-none">
                  <div className="text-right">
                    <p className="text-xl font-display font-black text-success leading-none">
                      R$ {Number(p.energy_bills?.total_amount || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">
                      {new Date(p.payment_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className="bg-success text-white border-transparent text-[9px] font-black uppercase px-3 shadow-sm">
                    {p.payment_type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
