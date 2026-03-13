import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, Download, Eye, Sun, Building2, 
  DollarSign, Calendar, Copy, Check, TrendingDown, TrendingUp,
  Zap, ArrowDownRight, HandCoins, Info, Upload, CalendarDays, Leaf,
  User, Mail, Phone, MapPin, Save, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { calculateBillMetrics } from '@/lib/calculations';
import { SolarBackground } from '@/components/SolarBackground';
import { motion } from 'framer-motion';
import { DashboardHero } from '@/components/DashboardHero';
import { RefinedStat } from '@/components/RefinedStat';
import { EnvironmentalImpact } from '@/components/EnvironmentalImpact';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { DailyWisdom } from '@/components/DailyWisdom';
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
  energisa_payment_proof_url: string | null;
  solar_payment_proof_url: string | null;
  price_per_kwh?: number;
  utility_tariff_used?: number;
  consumer_units?: { 
    unit_name: string;
    clients?: {
      name: string;
      email: string | null;
      override_pix: boolean;
      custom_pix_key: string | null;
      custom_pix_qr_code_url: string | null;
      custom_pix_receiver: string | null;
      price_per_kwh: number;
    } | null;
  } | null;
}

const monthsFull = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const monthsShort = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

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

export default function ClientDashboard() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [hasOverdue, setHasOverdue] = useState(false);
  const [globalPixKey, setGlobalPixKey] = useState('');
  const [globalPixReceiver, setGlobalPixReceiver] = useState('');
  const [globalQrUrl, setGlobalQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [profileData, setProfileData] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [billsRes, settingsRes, profileRes] = await Promise.all([
        supabase.from('energy_bills').select('*, consumer_units(unit_name, clients(*))')
          .order('year', { ascending: false }).order('month', { ascending: false }),
        supabase.from('energy_settings').select('*').limit(1).single(),
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      const b = (billsRes.data as any) || [];
      setBills(b);
      setHasOverdue(b.some((bill: Bill) => bill.payment_status === 'overdue'));

      if (settingsRes.data) {
        setGlobalPixKey((settingsRes.data as any).pix_key || '');
        setGlobalPixReceiver((settingsRes.data as any).pix_receiver || '');
        setGlobalQrUrl((settingsRes.data as any).pix_qr_code_url || '');
      }

      if (profileRes.data) {
        setProfileData(profileRes.data);
        setProfileName(profileRes.data.name || 'Cliente');
      } else {
        setProfileName(user.user_metadata?.name || 'Cliente');
      }

      // Auto-linking logic if unlinked
      const { data: linkedClients } = await supabase.from('clients').select('id').eq('user_id', user.id);
      if (!linkedClients || linkedClients.length === 0) {
        const userEmail = user.email?.toLowerCase();
        if (userEmail) {
          const { data: emailMatch } = await supabase.from('clients').select('id, user_id').ilike('email', userEmail).maybeSingle();
          if (emailMatch && !emailMatch.user_id) {
            await supabase.from('clients').update({ user_id: user.id }).eq('id', emailMatch.id);
            // Refresh bills after linking
            const { data: relinkedBills } = await supabase.from('energy_bills').select('*, consumer_units(unit_name, clients(*))')
              .order('year', { ascending: false }).order('month', { ascending: false });
            if (relinkedBills) setBills(relinkedBills as any);
          }
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      toast.error('Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleUploadProof = async (billId: string, file: File, type: 'energisa' | 'solar') => {
    const folder = type === 'energisa' ? 'proofs_energisa' : 'proofs_solar';
    const column = type === 'energisa' ? 'energisa_payment_proof_url' : 'solar_payment_proof_url';
    const path = `${folder}/${billId}/${file.name}`;
    
    try {
      const toastId = toast.loading('Fazendo upload...');
      const { error: uploadErr } = await supabase.storage.from('invoices').upload(path, file, { upsert: true, contentType: file.type });
      if (uploadErr) throw uploadErr;
      
      const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(path);
      const updates: any = { [column]: urlData.publicUrl };
      const currentBill = bills.find(b => b.id === billId);
      if (currentBill?.payment_status === 'pending') updates.payment_status = 'receipt_sent';

      const { error: updateErr } = await supabase.from('energy_bills').update(updates).eq('id', billId);
      if (updateErr) throw updateErr;

      toast.success('Comprovante enviado!', { id: toastId });
      load();
    } catch (err: any) {
      toast.error('Erro no upload: ' + err.message);
    }
  };

  const handleCopyPix = () => {
    if (!activePixKey) return;
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Chave PIX copiada!');
      } catch (err) {
        toast.error('Por favor, selecione o texto manualmente.');
      }
      document.body.removeChild(textArea);
    };

    if (!navigator.clipboard) {
      fallbackCopy(activePixKey);
    } else {
      navigator.clipboard.writeText(activePixKey)
        .then(() => { setCopied(true); toast.success('Chave PIX copiada!'); })
        .catch(() => fallbackCopy(activePixKey));
    }
    setTimeout(() => setCopied(false), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdatingProfile(true);
    const { error } = await supabase.from('profiles').update({
      name: profileData.name,
      phone: profileData.phone,
      address: profileData.address,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    if (error) toast.error('Erro ao atualizar dados: ' + error.message);
    else { toast.success('Dados atualizados!'); setEditingProfile(false); load(); }
    setUpdatingProfile(false);
  };

  const handleOpenPrivateFile = async (url: string) => {
    if (!url) return;
    try {
      if (url.includes('token=') || !url.includes('supabase.co')) {
        window.open(url, '_blank');
        return;
      }
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/storage/v1/object/public/');
      if (parts.length < 2) { window.open(url, '_blank'); return; }
      const fullPath = parts[1];
      const bucket = fullPath.split('/')[0];
      const path = fullPath.substring(bucket.length + 1);
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      toast.error('Erro ao abrir o arquivo.');
    }
  };

  const handleDownloadPDF = async (b: Bill) => {
    const toastId = toast.loading('Gerando PDF...');
    try {
      const client = b.consumer_units?.clients;
      const finalPixKey = client?.override_pix ? (client?.custom_pix_key?.trim() || globalPixKey) : globalPixKey;
      const finalPixQr = client?.override_pix ? (client?.custom_pix_qr_code_url?.trim() || globalQrUrl) : globalQrUrl;
      const finalPixReceiver = client?.override_pix ? (client?.custom_pix_receiver?.trim() || globalPixReceiver) : globalPixReceiver;

      const blob = await pdf(
        <BillPDF
          clientName={client?.name ?? profileName}
          unitName={b.consumer_units?.unit_name ?? ''}
          month={b.month} year={b.year} dueDate={b.due_date}
          injectedKwh={b.injected_energy_kwh || b.consumption_kwh}
          solarValue={b.solar_energy_value || b.total_amount}
          energisaValue={b.energisa_bill_value || 0}
          totalAmount={b.total_amount}
          paymentStatus={b.payment_status}
          pixKey={finalPixKey || undefined}
          pixQrUrl={finalPixQr || undefined}
          pixReceiver={finalPixReceiver || undefined}
          pricePerKwh={b.price_per_kwh || client?.price_per_kwh}
          utilityTariffUsed={b.utility_tariff_used}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `Fatura_${client?.name ?? profileName}_${monthsShort[b.month-1]}${b.year}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF gerado!', { id: toastId });
    } catch (err) {
      toast.error('Erro ao gerar PDF', { id: toastId });
    }
  };

  const currentBill = bills[0];
  const { estimatedUtilityCost, solarCost, monthlySavings, savingsPercentage } = calculateBillMetrics({
    injectedKwh: currentBill?.injected_energy_kwh || currentBill?.consumption_kwh || 0,
    solarValue: currentBill?.solar_energy_value || currentBill?.total_amount || 0,
    energisaBillValue: currentBill?.energisa_bill_value || 0,
    utilityTariffUsed: currentBill?.utility_tariff_used
  });

  const currentYear = new Date().getFullYear();
  const yearBills = bills.filter(b => b.year === currentYear);
  const totalYearSavings = yearBills.reduce((acc, b) => {
    const { monthlySavings } = calculateBillMetrics({
      injectedKwh: b.injected_energy_kwh || b.consumption_kwh,
      solarValue: b.solar_energy_value || b.total_amount - b.energisa_bill_value,
      energisaBillValue: b.energisa_bill_value,
      utilityTariffUsed: b.utility_tariff_used
    });
    return acc + monthlySavings;
  }, 0);

  const chartData = bills.slice(0, 12).reverse().map(b => {
    const metrics = calculateBillMetrics({
      injectedKwh: b.injected_energy_kwh || b.consumption_kwh,
      solarValue: b.solar_energy_value || b.total_amount,
      energisaBillValue: b.energisa_bill_value,
      utilityTariffUsed: b.utility_tariff_used
    });
    return {
      name: `${monthsShort[b.month - 1]}/${String(b.year).slice(2)}`,
      'Custo Energisa (Est.)': metrics.estimatedUtilityCost,
      'Custo SolControle': metrics.solarCost
    };
  });

  let runningSavings = 0;
  const cumulativeChartData = bills.filter(b => b.year === currentYear).reverse().map(b => {
    const { monthlySavings } = calculateBillMetrics({
      injectedKwh: b.injected_energy_kwh || b.consumption_kwh,
      solarValue: b.solar_energy_value || b.total_amount - b.energisa_bill_value,
      energisaBillValue: b.energisa_bill_value,
      utilityTariffUsed: b.utility_tariff_used
    });
    runningSavings += monthlySavings;
    return { month: monthsShort[b.month-1], 'Economia Acumulada': Number(runningSavings.toFixed(2)) };
  });

  const client = currentBill?.consumer_units?.clients;
  const activePixKey = client?.override_pix ? (client?.custom_pix_key || globalPixKey) : globalPixKey;
  const activePixReceiver = client?.override_pix ? (client?.custom_pix_receiver || globalPixReceiver) : globalPixReceiver;
  const activeQrUrl = client?.override_pix ? (client?.custom_pix_qr_code_url || globalQrUrl) : globalQrUrl;

  return (
    <div className="relative min-h-screen pb-20">
      <SolarBackground />
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
      >
        <DashboardHero 
          highlights={[
            { label: 'Energia Injetada', value: `${(currentBill?.injected_energy_kwh || 0).toLocaleString('pt-BR')} kWh`, icon: Zap },
            { label: 'Economia Total', value: `R$ ${totalYearSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp },
            { label: 'Sua Economia', value: `${savingsPercentage.toFixed(1)}%`, icon: TrendingDown },
          ]}
        />

        {currentBill ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <RefinedStat label="Injeção Solar" value={currentBill.injected_energy_kwh || 0} unit="kWh" icon={Sun} color="text-info" delay={0} />
              <RefinedStat label="Custo SolControle" value={solarCost} prefix="R$" icon={HandCoins} color="text-warning" decimals={2} delay={1} />
              <RefinedStat label="Economia Mês" value={monthlySavings} prefix="R$" icon={TrendingDown} color="text-success" decimals={2} delay={2} />
              <RefinedStat label={`Economia ${currentYear}`} value={totalYearSavings} prefix="R$" icon={Zap} color="text-success" decimals={2} delay={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden border-none text-white shadow-2xl relative min-h-[450px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-95" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(245,158,11,0.2),transparent_70%)]" />
                  <div className="relative p-6 bg-white/5 border-b border-white/10 font-bold flex items-center justify-between backdrop-blur-md">
                    <h3 className="font-display text-2xl flex items-center gap-3 text-primary"><HandCoins className="w-8 h-8" /> Pagamento Rápido</h3>
                    <Badge className="solar-gradient text-accent font-black uppercase text-[10px] tracking-widest px-3 py-1">PIX Instantâneo</Badge>
                  </div>
                  <CardContent className="relative p-8 flex flex-col items-center text-center space-y-8">
                    {activeQrUrl ? (
                      <div className="bg-white p-4 rounded-3xl border-4 border-primary/20 shadow-2xl">
                        <img src={activeQrUrl} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 object-contain" />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center"><Sun className="w-10 h-10 opacity-10 animate-spin-slow" /></div>
                    )}
                    <div className="w-full max-w-md space-y-6">
                      <div className="space-y-2 text-left">
                        <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest ml-2">Copia e Cola</p>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl group hover:border-primary/50 transition-all">
                          <p className="font-mono text-xs sm:text-sm font-bold text-white/90 truncate flex-1">{activePixKey || 'Não disponível'}</p>
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-primary hover:bg-primary/20" onClick={handleCopyPix}>
                            {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-white/10">
                        <div className="text-left">
                          <p className="text-[10px] text-white/40 mb-1 uppercase font-black">Total a Pagar</p>
                          <p className="text-4xl font-display font-black text-primary">R$ {currentBill.total_amount.toFixed(2)}</p>
                        </div>
                        <Button className="w-full sm:w-auto px-8 solar-gradient text-accent font-black h-14 rounded-xl shadow-lg hover:scale-[1.03] transition-all" onClick={handleCopyPix}>
                          {copied ? 'COPIADO' : 'COPIAR CHAVE PIX'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <EnvironmentalImpact totalKwh={bills.reduce((acc, b) => acc + (b.injected_energy_kwh || 0), 0)} variant="compact" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Pílula de Sabedoria</p>
                  <DailyWisdom variant="compact" />
                </div>
              </div>
            </div>

            <Card className="modern-card overflow-hidden ring-1 ring-border/50 border-t-8 border-t-primary">
              <CardHeader className="pb-8 pt-10 px-8 sm:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 bg-muted/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Referência da Fatura</p>
                  <CardTitle className="font-display text-3xl font-black flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary" /> {monthsFull[currentBill.month-1]} / {currentBill.year}
                  </CardTitle>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-md ${statusColors[currentBill.payment_status]}`}>{statusLabels[currentBill.payment_status]}</Badge>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Vencimento: {new Date(currentBill.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
              </CardHeader>
              <CardContent className="p-8 sm:p-12 space-y-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="p-6 rounded-3xl bg-muted/10 border border-border/50 space-y-4 shadow-inner">
                      <div className="flex justify-between border-b border-border/50 pb-3"><span className="text-xs font-bold text-muted-foreground uppercase">Serviço Solar</span><span className="font-black">R$ {solarCost.toFixed(2)}</span></div>
                      {currentBill.energisa_bill_value > 0 && <div className="flex justify-between border-b border-border/50 pb-3 text-info"><span className="text-xs font-bold uppercase">Encargos Energisa</span><span className="font-black">R$ {currentBill.energisa_bill_value.toFixed(2)}</span></div>}
                      <div className="flex justify-between pt-2"><span className="text-sm font-black text-primary uppercase">Total Fatura</span><span className="text-3xl font-black solar-gradient-text">R$ {currentBill.total_amount.toFixed(2)}</span></div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3">
                      {currentBill.invoice_file_url && <Button className="w-full h-14 solar-gradient text-accent font-black rounded-xl shadow-lg" onClick={() => handleDownloadPDF(currentBill)}><Download className="w-5 h-5 mr-3" /> Baixar Fatura SolControle</Button>}
                      {currentBill.energisa_bill_file_url && <Button variant="outline" className="w-full h-12 border-info/30 text-info font-bold rounded-xl" onClick={() => handleOpenPrivateFile(currentBill.energisa_bill_file_url!)}><Building2 className="w-4 h-4 mr-2" /> Boleto Concessionária</Button>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="cursor-pointer group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all bg-muted/5">
                        <Upload className={`w-8 h-8 ${currentBill.solar_payment_proof_url ? 'text-success' : 'text-muted-foreground opacity-30'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Comprovante Solar</span>
                        {currentBill.solar_payment_proof_url && <Check className="w-4 h-4 text-success" />}
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files?.[0] && handleUploadProof(currentBill.id, e.target.files[0], 'solar')} />
                      </label>
                      <label className="cursor-pointer group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all bg-muted/5">
                        <Upload className={`w-8 h-8 ${currentBill.energisa_payment_proof_url ? 'text-success' : 'text-muted-foreground opacity-30'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Comprovante Energisa</span>
                        {currentBill.energisa_payment_proof_url && <Check className="w-4 h-4 text-success" />}
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files?.[0] && handleUploadProof(currentBill.id, e.target.files[0], 'energisa')} />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="saas-card overflow-hidden h-[400px]">
                <CardHeader className="p-6"><CardTitle className="flex items-center gap-2 text-xl font-black uppercase"><TrendingDown className="w-5 h-5 text-success" /> Histórico de Custos</CardTitle></CardHeader>
                <CardContent className="h-[300px] p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} fontWeight={900} />
                      <YAxis fontSize={10} fontWeight={900} />
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar name="Energisa" dataKey="Custo Energisa (Est.)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      <Bar name="SolControle" dataKey="Custo SolControle" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="saas-card overflow-hidden h-[400px]">
                <CardHeader className="p-6"><CardTitle className="flex items-center gap-2 text-xl font-black uppercase"><TrendingUp className="w-5 h-5 text-primary" /> Evolução de Economia</CardTitle></CardHeader>
                <CardContent className="h-[300px] p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" fontSize={10} fontWeight={900} />
                      <YAxis fontSize={10} fontWeight={900} />
                      <Line type="monotone" dataKey="Economia Acumulada" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <ActivityTimeline events={bills.slice(0, 5).map(b => ({
              date: `${monthsFull[b.month - 1]} ${b.year}`,
              label: `Fatura Referente a ${monthsFull[b.month - 1]}`,
              status: b.payment_status as any,
              amount: `R$ ${b.total_amount.toFixed(2)}`
            }))} />

            <div id="perfil" className="pt-12 space-y-6">
              <div className="flex items-center gap-3"><div className="p-3 rounded-2xl bg-primary/10 text-primary"><User className="w-6 h-6" /></div><h2 className="text-2xl font-black uppercase tracking-tight">Meus Dados Cadastrais</h2></div>
              <Card className="saas-card border-t-4 border-t-primary">
                <CardContent className="p-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nome Completo</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={profileData?.name || ''} onChange={e => setProfileData({ ...profileData, name: e.target.value })} disabled={!editingProfile} className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/20 border border-border focus:border-primary outline-none font-bold" /></div></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-muted-foreground ml-1">E-mail</label><div className="relative opacity-60"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={profileData?.email || ''} readOnly className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/40 border border-border outline-none font-bold" /></div></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-muted-foreground ml-1">WhatsApp</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={profileData?.phone || ''} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} disabled={!editingProfile} className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/20 border border-border focus:border-primary outline-none font-bold" /></div></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Endereço</label><div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={profileData?.address || ''} onChange={e => setProfileData({ ...profileData, address: e.target.value })} disabled={!editingProfile} className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/20 border border-border focus:border-primary outline-none font-bold" /></div></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      {editingProfile ? (<><Button variant="ghost" onClick={() => setEditingProfile(false)} className="font-bold">Cancelar</Button><Button type="submit" disabled={updatingProfile} className="solar-gradient text-accent font-black h-12 px-8 rounded-xl">{updatingProfile ? 'Salvando...' : 'Salvar Dados'} <Save className="w-4 h-4 ml-2" /></Button></>) : (<Button onClick={() => setEditingProfile(true)} variant="outline" className="border-primary/20 text-primary font-black uppercase text-xs h-10 px-6 rounded-xl hover:bg-primary/5">Editar Dados</Button>)}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 pt-12 border-t border-border/50 pb-20">
              <div className="flex items-center justify-between"><h2 className="text-2xl font-black uppercase flex items-center gap-2"><CalendarDays className="w-6 h-6 text-muted-foreground" /> Histórico Completo</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bills.slice(1).map((b, idx) => (
                  <motion.div key={b.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="modern-card group border-t-4 border-t-muted">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-start"><div><p className="text-[10px] font-black text-muted-foreground uppercase">{monthsFull[b.month-1]} {b.year}</p><p className="text-xl font-black">R$ {b.total_amount.toFixed(2)}</p></div><Badge className={`${statusColors[b.payment_status]} text-[9px] font-black`}>{statusLabels[b.payment_status]}</Badge></div>
                        <div className="flex gap-2">{b.invoice_file_url && <Button variant="secondary" size="sm" className="flex-1 text-[10px] font-black" onClick={() => handleDownloadPDF(b)}>PDF</Button>}{b.solar_payment_proof_url && <Button variant="outline" size="icon" onClick={() => handleOpenPrivateFile(b.solar_payment_proof_url!)}><Eye className="w-4 h-4 text-success" /></Button>}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Card className="border-dashed py-24 glass-card text-center space-y-6">
            <div className="solar-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20"><Sun className="w-10 h-10 text-accent animate-pulse" /></div>
            <h3 className="text-2xl font-black">Sua jornada solar começa em breve</h3>
            <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">Assim que sua primeira fatura for processada, todos os dados de economia aparecerão aqui.</p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
