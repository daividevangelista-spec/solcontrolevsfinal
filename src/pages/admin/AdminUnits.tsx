import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Zap, Building2, MapPin, Hash, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ConsumerUnit {
  id: string;
  client_id: string;
  unit_name: string;
  meter_number: string | null;
  address: string | null;
  clients?: { name: string } | null;
}

interface Client {
  id: string;
  name: string;
}

export default function AdminUnits() {
  const [units, setUnits] = useState<ConsumerUnit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ConsumerUnit | null>(null);
  const [form, setForm] = useState({ client_id: '', unit_name: '', meter_number: '', address: '' });

  const load = async () => {
    const { data } = await supabase.from('consumer_units').select('*, clients(name)').order('created_at', { ascending: false });
    setUnits((data as any) || []);
    const { data: cData } = await supabase.from('clients').select('id, name');
    setClients(cData || []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (!form.client_id || !form.unit_name) {
        toast.error('Informe o cliente e o nome da unidade.');
        return;
      }

      if (editing) {
        const { error } = await supabase.from('consumer_units').update(form).eq('id', editing.id);
        if (error) throw error;
        toast.success('Unidade atualizada!');
      } else {
        const { error } = await supabase.from('consumer_units').insert(form);
        if (error) throw error;
        toast.success('Unidade adicionada!');
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover unidade?')) return;
    const { error } = await supabase.from('consumer_units').delete().eq('id', id);
    if (error) toast.error('Erro ao remover: ' + error.message);
    else { toast.success('Removida'); load(); }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* SaaS Header */}
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black tracking-tight">Unidades Consumidoras</h1>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              {units.length} pontos de consumo monitorados pelo SolControle
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm({ client_id: '', unit_name: '', meter_number: '', address: '' }); }} className="solar-gradient text-accent h-12 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 mr-2" /> Nova Unidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">{editing ? 'Editar Unidade' : 'Cadastrar Unidade'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Cliente Proprietário</Label>
                  <Select value={form.client_id} onValueChange={v => setForm({...form, client_id: v})}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Selecione o Cliente" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Identificação da Unidade (Ex: Residência, Loja 01)</Label>
                  <Input value={form.unit_name} onChange={e => setForm({...form, unit_name: e.target.value})} className="h-11 rounded-xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Nº do Medidor (Opcional)</Label>
                    <Input value={form.meter_number || ''} onChange={e => setForm({...form, meter_number: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Logradouro / Endereço</Label>
                    <Input value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                  {editing ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed">
            <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground font-medium">Nenhuma unidade consumidora cadastrada.</p>
          </div>
        )}
        {units.map(u => (
          <Card key={u.id} className="saas-card group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
            <CardContent className="p-6">
              <div className="flex flex-col h-full gap-5">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary" onClick={() => { setEditing(u); setForm({ client_id: u.client_id, unit_name: u.unit_name, meter_number: u.meter_number || '', address: u.address || '' }); setOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-black text-foreground truncate">{u.unit_name}</h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                      <UserCircle className="w-3.5 h-3.5" />
                      {u.clients?.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 border-t border-border/50 pt-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-muted-foreground/60">
                      <Hash className="w-3 h-3" />
                      Medidor: <span className="text-foreground tracking-normal">{u.meter_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-muted-foreground/60 truncate">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{u.address || 'Local não informado'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Badge variant="outline" className="w-full justify-center h-8 rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                    Monitoramento Ativo
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
