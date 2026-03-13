import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Upload, Sun, Building2, FileDown, Zap, CalendarDays, 
  Filter, Pencil, Trash2, Eye, CheckCircle, TrendingUp, Clock, 
  Check, Save, Search, MoreHorizontal, Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { pdf } from '@react-pdf/renderer';
import { BillPDF } from '@/components/BillPDF';

interface Bill {
  id: string;
  consumer_unit_id: string;
  month: number;
  year: number;
  consumption_kwh: number;
  price_per_kwh: number;
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
  consumer_units?: { 
    unit_name: string; 
    clients?: { 
      name: string;
      override_pix: boolean;
      custom_pix_key: string | null;
      custom_pix_qr_code_url: string | null;
      custom_pix_receiver: string | null;
    } | null;
  } | null;
}

interface Unit {
  id: string;
  unit_name: string;
  client_id: string;
  clients?: {
    name: string;
    tier_enabled?: boolean | null;
    tier_limit_kwh?: number | null;
    tier_price_low?: number | null;
    tier_price_high?: number | null;
  } | null;
}

const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-warning/10 text-warning border-warning/20', label: 'Pendente' },
  receipt_sent: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Comprovante' },
  awaiting_confirmation: { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', label: 'Aguardando' },
  paid: { color: 'bg-success/10 text-success border-success/20', label: 'Pago' },
  confirmed: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Confirmado' },
  overdue: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Vencido' },
};

function calcSolar(kwh: number, unit: Unit | undefined, defaultPrice: number): number {
  const client = unit?.clients;
  if (client?.tier_enabled) {
    const limit = client.tier_limit_kwh || 0;
    const lo = client.tier_price_low || 0;
    const hi = client.tier_price_high || 0;
    return kwh <= limit ? kwh * lo : limit * lo + (kwh - limit) * hi;
  }
  return kwh * defaultPrice;
}

export default function AdminBills() {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [pricePerKwh, setPricePerKwh] = useState(0);
  const [standardUtilityTariff, setStandardUtilityTariff] = useState(1.13); 
  const [pixKey, setPixKey] = useState('');
  const [pixReceiver, setPixReceiver] = useState('');
  const [pixQrUrl, setPixQrUrl] = useState('');

  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [form, setForm] = useState({
    consumer_unit_id: '', month: '', year: new Date().getFullYear().toString(),
    injected_energy_kwh: '', energisa_bill_value: '', due_date: '',
  });

  const [bulkForm, setBulkForm] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    due_date: '',
  });

  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: billsData } = await supabase
        .from('energy_bills')
        .select('*, consumer_units(unit_name, clients(name, override_pix, custom_pix_key, custom_pix_qr_code_url, custom_pix_receiver))')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      setBills((billsData as any) || []);

      const { data: unitsData } = await supabase
        .from('consumer_units')
        .select('id, unit_name, client_id, clients(name, tier_enabled, tier_limit_kwh, tier_price_low, tier_price_high)');
      setUnits((unitsData as any) || []);

      const { data: settingsData } = await supabase.from('energy_settings').select('*').limit(1).maybeSingle();
      if (settingsData) {
        setPricePerKwh(settingsData.price_per_kwh || 0);
        setStandardUtilityTariff((settingsData as any).standard_utility_tariff || 1.13);
        setPixKey((settingsData as any).pix_key || '');
        setPixReceiver((settingsData as any).pix_receiver || '');
        setPixQrUrl((settingsData as any).pix_qr_code_url || '');
      }
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreateOrUpdate = async () => {
    const selectedUnit = units.find(u => u.id === form.consumer_unit_id);
    const kwh = parseFloat(form.injected_energy_kwh || '0');
    const energisa = parseFloat(form.energisa_bill_value || '0');
    const solar = calcSolar(kwh, selectedUnit, pricePerKwh);
    const total = solar + energisa;

    const payload = {
      consumer_unit_id: form.consumer_unit_id,
      month: parseInt(form.month),
      year: parseInt(form.year),
      consumption_kwh: kwh,
      injected_energy_kwh: kwh,
      energisa_bill_value: energisa,
      due_date: form.due_date,
      utility_tariff_used: standardUtilityTariff,
      price_per_kwh: pricePerKwh,
      solar_energy_value: solar,
      total_amount: total
    };

    try {
      if (editingBill) {
        const { error } = await supabase.from('energy_bills').update(payload as any).eq('id', editingBill.id);
        if (error) throw error;
        toast.success("Fatura atualizada!");
      } else {
        const { error } = await supabase.from('energy_bills').insert(payload as any);
        if (error) throw error;
        toast.success("Fatura criada com sucesso!");
      }
      setOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkGenerate = async () => {
    if (!bulkForm.due_date) { toast.error('Informe a data de vencimento'); return; }
    const month = parseInt(bulkForm.month);
    const year = parseInt(bulkForm.year);
    
    try {
      const { data: existing } = await supabase.from('energy_bills').select('consumer_unit_id').eq('month', month).eq('year', year);
      const existingIds = new Set((existing || []).map((e: any) => e.consumer_unit_id));
      const toCreate = units.filter(u => !existingIds.has(u.id));

      if (toCreate.length === 0) {
        toast.info('Todas as unidades já possuem faturas para este período.');
        return;
      }

      const rows = toCreate.map(u => ({
        consumer_unit_id: u.id,
        month,
        year,
        consumption_kwh: 0,
        injected_energy_kwh: 0,
        price_per_kwh: pricePerKwh,
        solar_energy_value: 0,
        energisa_bill_value: 0,
        total_amount: 0,
        due_date: bulkForm.due_date,
        payment_status: 'pending',
        utility_tariff_used: standardUtilityTariff,
      }));

      const { error } = await supabase.from('energy_bills').insert(rows as any);
      if (error) throw error;

      toast.success(`${toCreate.length} faturas geradas em lote!`);
      setBulkOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (billId: string, status: string) => {
    const { error } = await supabase.from('energy_bills').update({ payment_status: status } as any).eq('id', billId);
    if (!error) {
      toast.success("Status atualizado");
      setBills(prev => prev.map(b => b.id === billId ? { ...b, payment_status: status } : b));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta fatura permanentemente?')) return;
    const { error } = await supabase.from('energy_bills').delete().eq('id', id);
    if (!error) {
      toast.success("Excluída");
      load();
    }
  };

  const handleDownloadPDF = async (b: Bill) => {
    const toastId = toast.loading('Gerando PDF...');
    try {
      const client = b.consumer_units?.clients;
      const finalPixKey = client?.override_pix ? (client?.custom_pix_key?.trim() || pixKey) : pixKey;
      const finalPixQr = client?.override_pix ? (client?.custom_pix_qr_code_url?.trim() || pixQrUrl) : pixQrUrl;
      const finalPixReceiver = client?.override_pix ? (client?.custom_pix_receiver?.trim() || pixReceiver) : pixReceiver;

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
          pricePerKwh={b.price_per_kwh}
          utilityTariffUsed={(b as any).utility_tariff_used}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fatura_${b.consumer_units?.clients?.name ?? 'cliente'}_${months[b.month - 1]}${b.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF Gerado!', { id: toastId });
    } catch (err: any) {
      toast.error('Erro ao gerar PDF: ' + err.message, { id: toastId });
    }
  };

  const handleUploadInvoice = async (billId: string, file: File, field: 'invoice_file_url' | 'energisa_bill_file_url' | 'energisa_payment_proof_url' | 'solar_payment_proof_url') => {
    const folder = field.includes('proof') ? 'proofs' : 'invoices';
    const path = `${folder}/${billId}_${field}_${Date.now()}.pdf`;
    
    setLoading(true);
    try {
      const { error: uploadErr } = await supabase.storage.from('invoices').upload(path, file);
      if (uploadErr) throw uploadErr;
      
      const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(path);
      const { error: updateErr } = await supabase.from('energy_bills').update({ [field]: urlData.publicUrl } as any).eq('id', billId);
      if (updateErr) throw updateErr;
      
      toast.success("Arquivo anexado!");
      load();
    } catch (err: any) {
      toast.error("Erro no upload: " + err.message);
    } finally {
      setLoading(false);
    }
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

  const filteredBills = bills.filter(b => {
    const matchesMonth = filterMonth === 'all' || b.month === parseInt(filterMonth);
    const matchesYear = !filterYear || b.year === parseInt(filterYear);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = b.consumer_units?.unit_name.toLowerCase().includes(searchLower) || 
                          b.consumer_units?.clients?.name.toLowerCase().includes(searchLower);
    return matchesMonth && matchesYear && matchesSearch;
  });

  const years = Array.from(new Set(bills.map(b => b.year))).sort((a,b) => b-a);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* SaaS Header */}
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-6 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black tracking-tight text-accent">Central de Faturamento</h1>
            <p className="text-white/80 font-bold text-xs flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-warning" />
              Gestão automatizada e auditoria de consumo solar
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-10 bg-white/10 border-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20" onClick={() => setBulkOpen(true)}>
              <Zap className="w-3.5 h-3.5 mr-2" /> Gerar Lote Mês
            </Button>
            <Button className="h-10 solar-gradient text-accent rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30" onClick={() => { setEditingBill(null); setForm({ consumer_unit_id: '', month: '', year: new Date().getFullYear().toString(), injected_energy_kwh: '', energisa_bill_value: '', due_date: '' }); setOpen(true); }}>
              <Plus className="w-3.5 h-3.5 mr-2" /> Nova Fatura
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Hub */}
      <Card className="saas-card overflow-hidden">
        <div className="h-1 solar-gradient" />
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1">
            <Label className="text-[10px] font-black uppercase text-muted-foreground/60 px-1">Busca Rápida</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-50" />
              <Input placeholder="Cliente ou Unidade..." className="h-10 pl-9 rounded-xl border-border/40 font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="w-full md:w-32 space-y-1">
            <Label className="text-[10px] font-black uppercase text-muted-foreground/60 px-1">Mês</Label>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="h-10 rounded-xl border-border/40 font-bold text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {months.map((m, i) => <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-32 space-y-1">
            <Label className="text-[10px] font-black uppercase text-muted-foreground/60 px-1">Ano</Label>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="h-10 rounded-xl border-border/40 font-bold text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 text-primary bg-primary/5 font-black text-[10px] uppercase">
            {filteredBills.length} Faturas
          </Badge>
        </CardContent>
      </Card>

      {/* Bills List - Compact Design */}
      <div className="grid gap-3">
        {loading ? (
            <div className="py-20 text-center opacity-30 animate-pulse">
                <Sun className="w-12 h-12 mx-auto mb-2 animate-spin-slow" />
                <p className="font-black uppercase text-xs tracking-widest">Sincronizando...</p>
            </div>
        ) : filteredBills.length === 0 ? (
            <div className="py-20 text-center bg-muted/20 border-2 border-dashed border-border/40 rounded-3xl">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                <p className="font-black uppercase text-xs text-muted-foreground/60">Nenhum registro encontrado</p>
            </div>
        ) : filteredBills.map(b => (
          <Card key={b.id} className="saas-card overflow-hidden hover:border-primary/40 transition-all group">
            <div className="flex flex-col md:flex-row">
              {/* Unit Info */}
              <div className="p-4 md:p-6 flex-1 min-w-0 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${b.payment_status === 'confirmed' ? 'bg-success/10 text-success' : 'bg-primary/5 text-primary'}`}>
                    {b.payment_status === 'confirmed' ? <CheckCircle className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-base truncate">{b.consumer_units?.clients?.name}</h3>
                    <Badge variant="outline" className="h-5 text-[8px] font-black uppercase tracking-tighter opacity-60">{b.consumer_units?.unit_name}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/70 uppercase">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {months[b.month-1]}/{b.year}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className={`flex items-center gap-1 ${b.payment_status === 'overdue' ? 'text-destructive' : ''}`}>
                        <Clock className="w-3 h-3" /> Venc: {new Date(b.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Values */}
              <div className="px-6 py-4 md:py-0 flex items-center md:justify-center gap-8 bg-muted/10 md:bg-transparent">
                <div className="text-center">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/40 mb-1">Solar</p>
                    <p className="text-sm font-black text-warning">R$ {Number(b.solar_energy_value).toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/40 mb-1">Taxas</p>
                    <p className="text-sm font-black text-info">R$ {Number(b.energisa_bill_value).toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/40 mb-1">Total</p>
                    <p className="text-lg font-display font-black solar-gradient-text leading-none">R$ {Number(b.total_amount).toFixed(2)}</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="p-4 md:p-6 flex flex-wrap md:flex-nowrap items-center justify-end gap-3 md:bg-muted/5 min-w-[280px]">
                <Select value={b.payment_status} onValueChange={(v) => handleStatusChange(b.id, v)}>
                    <SelectTrigger className={`h-9 w-36 rounded-xl font-black text-[9px] uppercase border-none shadow-sm ${statusConfig[b.payment_status]?.color}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                        {Object.entries(statusConfig).map(([key, value]) => (
                            <SelectItem key={key} value={key} className="text-[10px] uppercase font-black">{value.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all" onClick={() => handleDownloadPDF(b)} title="Gerar PDF">
                        <FileDown className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-info/10 text-info transition-all" onClick={() => { setEditingBill(b); setForm({ consumer_unit_id: b.consumer_unit_id, month: b.month.toString(), year: b.year.toString(), injected_energy_kwh: b.injected_energy_kwh.toString(), energisa_bill_value: b.energisa_bill_value.toString(), due_date: b.due_date }); setOpen(true); }} title="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted font-bold"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-2xl">
                            <DropdownMenuItem className="rounded-lg gap-2 text-[10px] font-black uppercase" onClick={() => b.invoice_file_url && handleOpenPrivateFile(b.invoice_file_url)}>
                                <Eye className="w-3.5 h-3.5 text-primary" /> Ver Fatura Solar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 text-[10px] font-black uppercase" onClick={() => b.energisa_bill_file_url && handleOpenPrivateFile(b.energisa_bill_file_url)}>
                                <Building2 className="w-3.5 h-3.5 text-info" /> Ver Conta Energisa
                            </DropdownMenuItem>
                            <div className="h-px bg-border my-1" />
                            <DropdownMenuItem className="rounded-lg gap-2 text-[10px] font-black uppercase text-destructive hover:text-white hover:bg-destructive" onClick={() => handleDelete(b.id)}>
                                <Trash2 className="w-3.5 h-3.5" /> Excluir Registro
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="h-3 solar-gradient" />
          <div className="p-8 space-y-6">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                        {editingBill ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </div>
                    {editingBill ? 'Editar Fatura' : 'Nova Fatura'}
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
                {!editingBill && (
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Unidade Consumidora</Label>
                        <Select value={form.consumer_unit_id} onValueChange={v => setForm({ ...form, consumer_unit_id: v })}>
                            <SelectTrigger className="h-12 rounded-2xl border-border/40 font-bold bg-muted/10"><SelectValue placeholder="Selecione a Unidade" /></SelectTrigger>
                            <SelectContent className="max-h-60 rounded-2xl font-bold">
                                {units.map(u => <SelectItem key={u.id} value={u.id}>{u.unit_name} ({u.clients?.name})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase px-1">Mês Ref.</Label>
                        <Select value={form.month} onValueChange={v => setForm({ ...form, month: v })}>
                            <SelectTrigger className="h-12 rounded-2xl bg-muted/10 border-border/40 font-bold"><SelectValue placeholder="Mês" /></SelectTrigger>
                            <SelectContent className="rounded-2xl font-bold">
                                {months.map((m, i) => <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase px-1">Ano Ref.</Label>
                        <Input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="h-12 rounded-2xl bg-muted/10 font-bold" />
                    </div>
                </div>

                <div className="p-4 rounded-3xl bg-warning/5 border border-warning/10 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-warning uppercase px-1"><Sun className="w-3.5 h-3.5" /> Geração Solar</div>
                    <div className="relative group">
                        <Input type="number" step="0.01" value={form.injected_energy_kwh} onChange={e => setForm({ ...form, injected_energy_kwh: e.target.value })} className="h-14 pr-16 rounded-2xl font-black text-2xl bg-white shadow-inner border-border/30 group-focus-within:ring-4 group-focus-within:ring-warning/10 transition-all text-center" placeholder="0" />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-muted-foreground/30 text-lg">kWh</span>
                    </div>
                </div>

                <div className="p-4 rounded-3xl bg-info/5 border border-info/10 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-info uppercase px-1"><Building2 className="w-3.5 h-3.5" /> Conta Energisa</div>
                    <div className="relative group">
                        <Input type="number" step="0.01" value={form.energisa_bill_value} onChange={e => setForm({ ...form, energisa_bill_value: e.target.value })} className="h-14 pl-14 rounded-2xl font-black text-2xl bg-white shadow-inner border-border/30 group-focus-within:ring-4 group-focus-within:ring-info/10 transition-all text-center" placeholder="0" />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-muted-foreground/30 text-lg">R$</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase px-1 text-muted-foreground">Vencimento da Fatura</Label>
                    <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="h-12 rounded-2xl bg-muted/10 font-bold border-border/40" />
                </div>
            </div>

            <Button onClick={handleCreateOrUpdate} className="w-full h-14 rounded-2xl solar-gradient text-accent font-black text-lg tracking-widest shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95">
                {editingBill ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR REGISTRO'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Generate Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-8 border-none shadow-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                    <div className="p-2.5 rounded-2xl bg-warning/10 text-warning shadow-inner">
                        <Zap className="w-6 h-6" />
                    </div>
                    Lote do Mês
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                    Este comando criará automaticamente faturas pendentes para todas as <span className="text-warning font-black">{units.length} unidades</span> que ainda não possuem registro no período selecionado.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground px-1">Mês</Label>
                        <Select value={bulkForm.month} onValueChange={v => setBulkForm({ ...bulkForm, month: v })}>
                            <SelectTrigger className="h-11 rounded-xl bg-muted/10 font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl font-bold">
                                {months.map((m, i) => <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground px-1">Ano</Label>
                        <Input value={bulkForm.year} onChange={e => setBulkForm({ ...bulkForm, year: e.target.value })} className="h-11 rounded-xl bg-muted/10 font-bold text-center" />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground px-1">Data de Vencimento Geral</Label>
                    <Input type="date" value={bulkForm.due_date} onChange={e => setBulkForm({ ...bulkForm, due_date: e.target.value })} className="h-11 rounded-xl bg-muted/10 font-bold" />
                </div>

                <Button onClick={handleBulkGenerate} className="w-full h-12 rounded-xl solar-gradient text-accent font-black tracking-widest shadow-xl hover:-translate-y-1 transition-all">
                   INICIAR PROCESSAMENTO
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
