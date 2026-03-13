import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, Trash2, Bell, Settings as SettingsIcon, History, Save, Info as InfoIcon, Zap, CreditCard, ShieldCheck } from 'lucide-react';

export default function AdminSettings() {
  const [price, setPrice] = useState('');
  const [standardTariff, setStandardTariff] = useState('1.13');
  const [pixKey, setPixKey] = useState('');
  const [pixReceiver, setPixReceiver] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [id, setId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notification states
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState('3');
  const [autoOverdue, setAutoOverdue] = useState(true);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    loadNotifLogs();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from('energy_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      
      if (data) {
        setPrice(String(data.price_per_kwh || '0'));
        setStandardTariff(String((data as any).standard_utility_tariff || '1.13'));
        setPixKey((data as any).pix_key || '');
        setPixReceiver((data as any).pix_receiver || '');
        setQrCodeUrl((data as any).pix_qr_code_url || '');
        setNotifEnabled((data as any).notifications_enabled ?? true);
        setReminderDays(String((data as any).reminder_days_before || '3'));
        setAutoOverdue((data as any).auto_overdue_alerts ?? true);
        setId(data.id);
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      toast.error('Erro ao carregar configurações: ' + err.message);
    }
  };

  const loadNotifLogs = async () => {
    try {
      // Try to fetch notifications, handle potential missing table or relationship gracefully
      const { data, error } = await supabase
        .from('notifications')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
          console.warn('Notifications fetch error - table might not exist or schema changed:', error);
          return;
      }
      if (data) setRecentLogs(data);
    } catch (err) {
      console.warn('Silent catch for notification logs:', err);
    }
  };

  const handleSave = async () => {
    if (!id) {
        toast.error('Nenhuma configuração encontrada para atualizar.');
        return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('energy_settings').update({
        price_per_kwh: parseFloat(price) || 0,
        standard_utility_tariff: parseFloat(standardTariff) || 1.13,
        pix_key: pixKey,
        pix_receiver: pixReceiver,
        pix_qr_code_url: qrCodeUrl,
        notifications_enabled: notifEnabled,
        reminder_days_before: parseInt(reminderDays) || 3,
        auto_overdue_alerts: autoOverdue,
      } as any).eq('id', id);
      
      if (error) throw error;
      toast.success('Configurações salvas com sucesso!');
      loadSettings();
    } catch (err: any) {
      toast.error('Falha ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    
    setUploading(true);
    const path = `global/${Date.now()}_${file.name}`;
    try {
      const { error: uploadErr } = await supabase.storage.from('qrcodes').upload(path, file, { 
        upsert: true,
        contentType: file.type
      });
      
      if (uploadErr) throw uploadErr;
      
      const { data: urlData } = supabase.storage.from('qrcodes').getPublicUrl(path);
      setQrCodeUrl(urlData.publicUrl);
      toast.info('QR Code carregado. Clique em SALVAR para confirmar.');
    } catch (err: any) {
      toast.error('Erro no upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* SaaS Header */}
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-black tracking-tight text-accent">Configurações SolControle</h1>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-warning" />
              Gestão centralizada do ecossistema solar
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving || uploading || !id} 
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white h-12 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl backdrop-blur-md transition-all active:scale-95"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
            ) : (
              <Save className="w-5 h-5 mr-3" />
            )}
            {saving ? 'PROCESSANDO...' : 'SALVAR AJUSTES'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="bg-muted/30 p-1.5 h-14 rounded-2xl border border-border/50 mb-8 w-fit backdrop-blur-sm">
          <TabsTrigger value="geral" className="px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] h-11 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all gap-2">
            <SettingsIcon className="w-3.5 h-3.5" /> Geral
          </TabsTrigger>
          <TabsTrigger value="notifications" className="px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] h-11 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all gap-2">
            <Bell className="w-3.5 h-3.5" /> Automação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="saas-card overflow-hidden border-t-4 border-t-primary shadow-2xl">
              <CardHeader className="pb-8">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                    <Zap className="w-6 h-6" />
                  </div>
                  Parâmetros Financeiros
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground/60">Controle de taxas e precificação base</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Preço kWh Solar (Padrão)</Label>
                  <div className="relative group">
                    <Input type="number" step="0.0001" value={price} onChange={e => setPrice(e.target.value)} className="h-14 pl-14 rounded-2xl font-black text-2xl bg-muted/5 group-hover:bg-muted/10 transition-colors shadow-inner border-border/50" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary/40 text-xl">R$</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tarifa Concessionária (Base)</Label>
                  <div className="relative group">
                    <Input type="number" step="0.01" value={standardTariff} onChange={e => setStandardTariff(e.target.value)} className="h-14 pl-14 rounded-2xl font-black text-2xl bg-muted/5 group-hover:bg-muted/10 transition-colors shadow-inner border-border/50" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-muted-foreground/40 text-xl">R$</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="saas-card overflow-hidden border-t-4 border-t-primary shadow-2xl">
              <CardHeader className="pb-8">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  Dados de Recebimento
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground/60">Configuração Global de PIX</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Chave PIX Global</Label>
                    <Input placeholder="E-mail ou CPF/CNPJ" value={pixKey} onChange={e => setPixKey(e.target.value)} className="h-12 rounded-xl border-border/50 bg-muted/5 shadow-inner font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Beneficiário</Label>
                    <Input placeholder="Nome do Titular" value={pixReceiver} onChange={e => setPixReceiver(e.target.value)} className="h-12 rounded-xl border-border/50 bg-muted/5 shadow-inner font-bold" />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border/50">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-4 block">QR Code para Pagamento</Label>
                  <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-3xl bg-muted/20 border-2 border-dashed border-border/60">
                    <div className="shrink-0">
                      {qrCodeUrl ? (
                        <div className="relative group p-3 bg-white rounded-3xl shadow-2xl ring-4 ring-primary/10">
                          <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 object-contain rounded-xl" />
                          <button onClick={() => setQrCodeUrl('')} className="absolute -top-3 -right-3 h-8 w-8 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-28 border-4 border-dashed border-border/30 rounded-3xl flex items-center justify-center bg-white/50 text-muted-foreground/40 text-[9px] font-black uppercase text-center p-4">Aguardando Imagem</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <Input type="file" accept="image/*" className="hidden" id="qr-upload" onChange={handleUploadQR} disabled={uploading} />
                      <Button variant="outline" className="w-full h-14 rounded-2xl bg-white border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-black text-xs uppercase tracking-[0.1em] shadow-lg" asChild disabled={uploading}>
                        <label htmlFor="qr-upload" className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-3" />
                          {uploading ? 'ENVIANDO...' : 'TROCAR IMAGEM QR'}
                        </label>
                      </Button>
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">Formato PNG ou JPG altamente recomendado</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="saas-card border-none shadow-2xl overflow-hidden">
                    <div className="h-2 solar-gradient" />
                    <CardHeader className="bg-muted/10 border-b border-border/50 pb-8">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-primary" /> Lógica de Disparo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/5 border border-border/30">
                            <div className="space-y-1">
                                <span className="text-sm font-black uppercase">Notificações Ativas</span>
                                <p className="text-[10px] text-muted-foreground font-bold">Inibe ou habilita todo o sistema de mensagens</p>
                            </div>
                            <Switch checked={notifEnabled} onCheckedChange={setNotifEnabled} className="data-[state=checked]:bg-success" />
                        </div>

                        <div className="space-y-4 p-6 rounded-3xl bg-primary/5 border border-primary/10 shadow-inner">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2 block">Antecedência de Lembrete</Label>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Input type="number" className="h-16 pl-14 rounded-2xl font-black text-3xl bg-white accent-primary" value={reminderDays} onChange={e => setReminderDays(e.target.value)} />
                                    <Bell className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/30" />
                                </div>
                                <span className="text-xs font-black uppercase text-muted-foreground/60 w-20 leading-tight">Dias antes do prazo</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-3xl bg-destructive/5 border border-destructive/10">
                            <div className="space-y-1">
                                <span className="text-sm font-black uppercase text-destructive">Alerta de Atraso</span>
                                <p className="text-[10px] text-destructive/50 font-bold">Disparo imediato após o vencimento</p>
                            </div>
                            <Switch checked={autoOverdue} onCheckedChange={setAutoOverdue} className="data-[state=checked]:bg-destructive" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="saas-card border-none shadow-2xl overflow-hidden flex flex-col">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <History className="w-6 h-6 text-muted-foreground" /> Auditoria Recente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar space-y-3">
                        {recentLogs.length === 0 ? (
                            <div className="h-[300px] flex flex-col items-center justify-center opacity-20 grayscale">
                                <History className="w-12 h-12 mb-4" />
                                <p className="text-xs font-black uppercase">Sem Disparos Registrados</p>
                            </div>
                        ) : recentLogs.map(log => (
                            <div key={log.id} className="p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted/10 transition-all flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="font-black text-sm">{log.profiles?.name || 'Cliente'}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground/50">{new Date(log.created_at).toLocaleTimeString('pt-BR')}</span>
                                </div>
                                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                                    <Badge variant="ghost" className="text-[9px] font-black uppercase tracking-tighter text-primary px-1">{log.type}</Badge>
                                    <Badge className={`text-[8px] font-black uppercase ${log.status === 'sent' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{log.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
