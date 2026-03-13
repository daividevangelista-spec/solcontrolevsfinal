import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Sun, Building2, CalendarDays, History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { pdf } from '@react-pdf/renderer';
import { BillPDF } from '@/components/BillPDF';

interface Bill {
  id: string;
  month: number;
  year: number;
  consumption_kwh: number;
  total_amount: number;
  due_date: string;
  payment_status: string;
  invoice_file_url: string | null;
  injected_energy_kwh: number;
  solar_energy_value: number;
  energisa_bill_value: number;
  energisa_bill_file_url: string | null;
  billing_mode?: 'combined' | 'separate';
  concessionaria_value?: number | null;
  concessionaria_bill_url?: string | null;
  price_per_kwh?: number;
  utility_tariff_used?: number;
  consumer_units?: { 
    unit_name: string;
    clients?: {
      name: string;
      override_pix: boolean;
      custom_pix_key: string | null;
      custom_pix_qr_code_url: string | null;
      custom_pix_receiver: string | null;
      price_per_kwh: number;
    } | null;
  } | null;
}

const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  receipt_sent: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  paid: 'bg-success/20 text-success border-success/30',
  confirmed: 'bg-success/20 text-success border-success/30',
  overdue: 'bg-destructive/20 text-destructive border-destructive/30',
};
const statusLabels: Record<string, string> = { 
  pending: 'Pendente', 
  receipt_sent: 'Comprovante Enviado',
  paid: 'Pago', 
  confirmed: 'Confirmado',
  overdue: 'Vencida' 
};

export default function ClientBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBills = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let loadedBills: any[] = [];
        const { data, error: billsError } = await supabase
          .from('energy_bills')
          .select('*, consumer_units(unit_name, clients(*))')
          .order('due_date', { ascending: false });
          
        if (billsError) throw billsError;
        loadedBills = data || [];

        // Auto-link logic if no bills and user not linked
        if (loadedBills.length === 0 && user.email) {
          const { data: linkedClients } = await supabase.from('clients').select('id').eq('user_id', user.id);
          if (!linkedClients || linkedClients.length === 0) {
            const { data: emailMatch } = await supabase.from('clients').select('id, user_id').ilike('email', user.email).maybeSingle();
            if (emailMatch && !emailMatch.user_id) {
              await supabase.from('clients').update({ user_id: user.id }).eq('id', emailMatch.id);
              // Retry fetch
              const { data: retryData } = await supabase
                .from('energy_bills')
                .select('*, consumer_units(unit_name, clients(*))')
                .order('due_date', { ascending: false });
              loadedBills = retryData || [];
            }
          }
        }

        setBills(loadedBills);
      } catch (error) {
        console.error('Error loading bills:', error);
        toast.error('Erro ao carregar histórico de faturas');
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, [user]);

  const handleDownloadPDF = async (b: Bill) => {
    const toastId = toast.loading('Gerando PDF...');
    try {
      const client = b.consumer_units?.clients;
      const settingsRes = await supabase.from('energy_settings').select('pix_key, pix_receiver, pix_qr_code_url').limit(1).single();
      const settings = (settingsRes.data as any) || {};
      
      const finalPixKey = client?.override_pix ? (client?.custom_pix_key?.trim() || settings.pix_key) : settings.pix_key;
      const finalPixQr = client?.override_pix ? (client?.custom_pix_qr_code_url?.trim() || settings.pix_qr_code_url) : settings.pix_qr_code_url;
      const finalPixReceiver = client?.override_pix ? (client?.custom_pix_receiver?.trim() || settings.pix_receiver) : settings.pix_receiver;

      const blob = await pdf(
        <BillPDF
          clientName={client?.name ?? 'Cliente'}
          unitName={b.consumer_units?.unit_name ?? ''}
          month={b.month} year={b.year}
          dueDate={b.due_date}
          injectedKwh={Number(b.injected_energy_kwh ?? b.consumption_kwh)}
          solarValue={Number(b.solar_energy_value ?? b.total_amount)}
          energisaValue={Number(b.energisa_bill_value ?? 0)}
          totalAmount={Number(b.total_amount)}
          paymentStatus={b.payment_status}
          pixKey={finalPixKey || undefined}
          pixQrUrl={finalPixQr || undefined}
          pixReceiver={finalPixReceiver || undefined}
          pricePerKwh={b.price_per_kwh || client?.price_per_kwh}
          utilityTariffUsed={b.utility_tariff_used}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fatura_${client?.name ?? 'cliente'}_${months[b.month - 1]}${b.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF gerado!', { id: toastId });
    } catch (err: any) {
      console.error('PDF error:', err);
      toast.error('Erro ao gerar PDF: ' + (err?.message ?? String(err)), { id: toastId });
    }
  };

  const handleOpenPrivateFile = async (url: string) => {
    if (!url) return;
    try {
      if (!url.includes('supabase.co')) {
        window.open(url, '_blank');
        return;
      }
      
      const parts = url.split('/storage/v1/object/public/invoices/');
      if (parts.length < 2) {
        window.open(url, '_blank');
        return;
      }

      const filePath = decodeURIComponent(parts[1]);
      
      const { data, error } = await supabase.storage
        .from('invoices')
        .createSignedUrl(filePath, 60);

      if (error) {
        console.error('Storage sign error:', error);
        window.open(url, '_blank');
        return;
      }
      
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      toast.error('Erro ao abrir o arquivo.');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black tracking-tight">Histórico de Faturas</h1>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-warning" />
              Gestão completa dos seus créditos e débitos de energia
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md shadow-inner text-xs font-black uppercase tracking-widest">
            {bills.length} Registros
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {bills.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
            <History className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Nenhuma fatura registrada no sistema.</p>
          </div>
        ) : (
          bills.map(b => (
            <Card key={b.id} className={`saas-card overflow-hidden transition-all duration-300 hover:scale-[1.01] ${b.payment_status === 'overdue' ? 'ring-2 ring-destructive/50 border-destructive/30' : 'border-border/50'}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
                  <div className="p-6 flex-1 bg-gradient-to-br from-card to-muted/20 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-xl font-display font-black text-foreground truncate">
                          {b.consumer_units?.unit_name || 'Unidade Consumidora'}
                        </h3>
                        <p className="text-sm font-bold text-muted-foreground/60 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          Referência: {months[b.month - 1]} de {b.year}
                        </p>
                      </div>
                      <Badge className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg ${statusColors[b.payment_status]}`}>
                        {statusLabels[b.payment_status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-warning/5 border border-warning/10">
                        <div className="flex items-center gap-2 text-[10px] font-black text-warning uppercase tracking-widest mb-1">
                          <Sun className="w-3.5 h-3.5" /> Geração Solar
                        </div>
                        <p className="text-sm font-bold text-muted-foreground/80">{Number(b.injected_energy_kwh || b.consumption_kwh)} kWh</p>
                        <p className="text-lg font-display font-black solar-gradient-text leading-none mt-1">
                          R$ {Number(b.solar_energy_value || b.total_amount).toFixed(2)}
                        </p>
                      </div>

                      {Number(b.energisa_bill_value) > 0 && (
                        <div className="p-4 rounded-2xl bg-info/5 border border-info/10">
                          <div className="flex items-center gap-2 text-[10px] font-black text-info uppercase tracking-widest mb-1">
                            <Building2 className="w-3.5 h-3.5" /> Energisa
                          </div>
                          <p className="text-sm font-bold text-muted-foreground/80">Taxas e Encargos</p>
                          <p className="text-lg font-display font-black text-info leading-none mt-1">
                            R$ {Number(b.energisa_bill_value).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-80 p-6 flex flex-col justify-center gap-4 bg-muted/5">
                    <div className="space-y-1 text-center md:text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Total da Fatura</p>
                      <p className="text-4xl font-display font-black solar-gradient-text">
                        R$ {Number(b.total_amount).toFixed(2)}
                      </p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                        Vencimento: {new Date(b.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        className="w-full h-12 rounded-xl solar-gradient text-accent font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        onClick={() => handleDownloadPDF(b)}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                      </Button>
                      
                      {b.energisa_bill_file_url && (
                        <Button 
                          variant="outline"
                          className="w-full h-11 rounded-xl border-info/20 text-info hover:bg-info/5 font-bold uppercase text-[10px] tracking-widest"
                          onClick={() => handleOpenPrivateFile(b.energisa_bill_file_url!)}
                        >
                          <Building2 className="w-3.5 h-3.5 mr-2" /> Boleto Energisa
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
