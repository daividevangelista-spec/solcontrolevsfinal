import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, UserCheck, UserMinus, ShieldCheck, Mail, Phone, MapPin, NotebookPen, CreditCard, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  user_id: string | null;
  tier_enabled: boolean | null;
  tier_limit_kwh: number | null;
  tier_price_low: number | null;
  tier_price_high: number | null;
  override_pix: boolean | null;
  pix_key: string | null;
  pix_qrcode_url: string | null;
  pix_holder_name: string | null;
  created_by?: string | null;
}

export default function AdminClients() {
  const { user, role } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', address: '', notes: '',
    tier_enabled: false, tier_limit_kwh: 800, tier_price_low: 0, tier_price_high: 0,
    override_pix: false, pix_key: '', pix_qrcode_url: '', pix_holder_name: ''
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    setClients((data as any) || []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (!form.name || !form.email || !form.phone || !form.address) {
        toast.error('Por favor, preencha todos os campos obrigatórios: Nome, Email, Telefone e Endereço.');
        return;
      }

      if (editing) {
        const { error } = await supabase.from('clients').update(form).eq('id', editing.id);
        if (error) throw error;
        toast.success('Cliente atualizado!');
      } else {
        const { error } = await supabase.from('clients').insert({
          ...form,
          created_by: user?.id
        } as any);
        if (error) throw error;
        toast.success('Cliente adicionado!');
      }
      setOpen(false);
      setEditing(null);
      setPreviewUrl(null);
      setForm({ 
        name: '', email: '', phone: '', address: '', notes: '',
        tier_enabled: false, tier_limit_kwh: 800, tier_price_low: 0, tier_price_high: 0,
        override_pix: false, pix_key: '', pix_qrcode_url: '', pix_holder_name: ''
      });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Support multiple formats
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Formato não suportado. Use PNG, JPG, SVG ou WEBP.');
      return;
    }

    // Immediate preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `client_${Date.now()}.${fileExt}`;
    const path = fileName;
    
    try {
      const { error: uploadErr } = await supabase.storage.from('qrcodes').upload(path, file, { 
        upsert: true,
        cacheControl: '3600',
        contentType: file.type
      });
      
      if (uploadErr) {
        console.error('QR Storage error details:', uploadErr);
        if (uploadErr.message.includes('403') || uploadErr.message.toLowerCase().includes('permission')) {
          throw new Error('Permissão negada no bucket "qrcodes". Verifique se as políticas RLS foram aplicadas no Supabase.');
        }
        if (uploadErr.message.toLowerCase().includes('bucket not found')) {
          throw new Error('O bucket "qrcodes" não foi encontrado no Supabase. Por favor, crie o bucket manualmente ou execute o script SQL de migração.');
        }
        throw uploadErr;
      }
      
      const { data: urlData } = supabase.storage.from('qrcodes').getPublicUrl(path);
      setForm(prev => ({ ...prev, pix_qrcode_url: urlData.publicUrl }));
      toast.success('QR Code enviado com sucesso!');
    } catch (err: any) {
      console.error('QR Upload error summary:', err);
      toast.error('Erro no upload: ' + (err.message || 'Erro desconhecido ao enviar arquivo para o bucket "qrcodes"'));
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este cliente?')) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Cliente removido'); load(); }
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({ 
      name: client.name, email: client.email, phone: client.phone || '', address: client.address || '', notes: client.notes || '',
      tier_enabled: client.tier_enabled || false,
      tier_limit_kwh: client.tier_limit_kwh || 800,
      tier_price_low: client.tier_price_low || 0,
      tier_price_high: client.tier_price_high || 0,
      override_pix: client.override_pix || false,
      pix_key: client.pix_key || '',
      pix_qrcode_url: client.pix_qrcode_url || '',
      pix_holder_name: client.pix_holder_name || ''
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ 
      name: '', email: '', phone: '', address: '', notes: '',
      tier_enabled: false, tier_limit_kwh: 800, tier_price_low: 0, tier_price_high: 0,
      override_pix: false, pix_key: '', pix_qrcode_url: '', pix_holder_name: ''
    });
    setOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* SaaS Header */}
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black tracking-tight">Base de Clientes</h1>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-warning" />
              {clients.length} parceiros cadastrados no sistema SolControle
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="solar-gradient text-accent h-12 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 mr-2" /> Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">{editing ? 'Editar Informações' : 'Cadastrar Novo Parceiro'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Nome Completo</Label>
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Endereço de Email</Label>
                    <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">WhatsApp / Telefone</Label>
                    <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Localização / Endereço</Label>
                    <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Observações Internas</Label>
                  <Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="h-11 rounded-xl" />
                </div>
                
                <div className="p-4 rounded-2xl border border-warning/20 bg-warning/5 space-y-4">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-warning" />
                      <Label htmlFor="tier_enabled" className="text-sm font-black text-warning uppercase">Configuração de Tiers</Label>
                    </div>
                    <input type="checkbox" id="tier_enabled" checked={form.tier_enabled} onChange={e => setForm({...form, tier_enabled: e.target.checked})} className="w-5 h-5 rounded-lg border-warning/30 text-warning focus:ring-warning/20" />
                  </div>
                  {form.tier_enabled && (
                    <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black opacity-60">Limite (kWh)</Label><Input type="number" value={form.tier_limit_kwh} onChange={e => setForm({...form, tier_limit_kwh: parseFloat(e.target.value)})} className="h-10 rounded-lg" /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-black opacity-60">Base (R$)</Label><Input type="number" step="0.01" value={form.tier_price_low} onChange={e => setForm({...form, tier_price_low: parseFloat(e.target.value)})} className="h-10 rounded-lg" /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-black opacity-60">Excedente (R$)</Label><Input type="number" step="0.01" value={form.tier_price_high} onChange={e => setForm({...form, tier_price_high: parseFloat(e.target.value)})} className="h-10 rounded-lg" /></div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-info/20 bg-info/5 space-y-4">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-info" />
                      <Label htmlFor="override_pix" className="text-sm font-black text-info uppercase">PIX Personalizado</Label>
                    </div>
                    <input type="checkbox" id="override_pix" checked={form.override_pix} onChange={e => setForm({...form, override_pix: e.target.checked})} className="w-5 h-5 rounded-lg border-info/30 text-info focus:ring-info/20" />
                  </div>
                  {form.override_pix && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><Label className="text-[10px] font-black opacity-60">Chave PIX</Label><Input value={form.pix_key} onChange={e => setForm({...form, pix_key: e.target.value})} className="h-10 rounded-lg" /></div>
                        <div className="space-y-1.5"><Label className="text-[10px] font-black opacity-60">Titular da Conta</Label><Input value={form.pix_holder_name} onChange={e => setForm({...form, pix_holder_name: e.target.value})} className="h-10 rounded-lg" /></div>
                      </div>
                      
                      <div className="bg-white/50 p-3 rounded-xl border border-info/10 flex items-center gap-6">
                        {(previewUrl || form.pix_qrcode_url) ? (
                          <div className="relative group">
                            <img src={previewUrl || form.pix_qrcode_url || ''} alt="QR Code" className="w-20 h-20 object-contain rounded-lg border bg-white p-1" />
                            <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setForm({...form, pix_qrcode_url: ''}); setPreviewUrl(null); }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 border-2 border-dashed border-info/20 rounded-xl flex items-center justify-center text-[8px] font-black text-info/40 text-center uppercase p-2">Sem QR Code</div>
                        )}
                        <div className="flex-1">
                          <Input type="file" accept="image/*" className="hidden" id="qr-client-upload" onChange={handleUploadQR} disabled={uploading} />
                          <Button variant="ghost" className="w-full h-12 border border-info/20 text-info font-black text-[10px] uppercase tracking-widest hover:bg-info/10" asChild disabled={uploading}>
                            <label htmlFor="qr-client-upload" className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              {uploading ? 'Processando...' : 'Fazer Upload do QR Code'}
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" disabled={uploading}>
                  {editing ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {clients.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed">
            <UserMinus className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground font-medium">Nenhum cliente parceiro encontrado na base.</p>
          </div>
        )}
        {clients.map(c => (
          <Card key={c.id} className="saas-card group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border/50">
                <div className="p-6 flex-1 min-w-0 flex items-start gap-5">
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${c.user_id ? 'bg-success/10 text-success shadow-lg shadow-success/10' : 'bg-muted/50 text-muted-foreground'}`}>
                    {c.user_id ? <UserCheck className="w-8 h-8" /> : <UserMinus className="w-8 h-8" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-display font-black text-foreground truncate">{c.name}</h2>
                        <Badge variant="outline" className={`h-5 text-[9px] font-black uppercase tracking-widest ${c.user_id ? 'bg-success/5 text-success border-success/20' : 'bg-muted/50 text-muted-foreground border-border'}`}>
                          {c.user_id ? 'Vinculado' : 'Sem acesso'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-muted-foreground/70">
                        <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{c.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{c.phone || 'Sem contato'}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
                        <MapPin className="w-3 h-3 opacity-60" /> {c.address || 'Local não informado'}
                      </div>
                      {c.tier_enabled && (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-black text-[9px] uppercase">
                          Tier Habilitado
                        </Badge>
                      )}
                      {c.override_pix && (
                        <Badge variant="outline" className="bg-info/10 text-info border-info/20 font-black text-[9px] uppercase">
                          PIX Custom
                        </Badge>
                      )}
                    </div>

                    {c.notes && (
                      <div className="p-3 bg-muted/20 rounded-xl border border-border/30 italic text-xs text-muted-foreground/80 flex items-start gap-2">
                        <NotebookPen className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        "{c.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:w-24 flex sm:flex-col gap-3 justify-center items-center bg-muted/5">
                  {(role === 'admin' || c.created_by === user?.id) ? (
                    <>
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all" onClick={() => openEdit(c)}>
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-all" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline" className="text-[8px] uppercase opacity-50">Bloqueado</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
