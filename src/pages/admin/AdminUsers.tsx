import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, UserPlus, ShieldPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'client';
  created_at: string;
}

export default function AdminUsers() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  // We cannot read auth.users directly via the Supabase Data API for security reasons,
  // so we'll just manage roles. Users register via the standard Auth flow, and we just upgrade their role here.
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ user_id: '' });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Erro ao carregar administradores.');
    else setRoles(data as any || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMakeAdmin = async () => {
    if (!form.user_id) return;
    try {
      // First try to check if it exists
      const { data: existing } = await supabase.from('user_roles').select('*').eq('user_id', form.user_id).single();
      
      let error;
      if (existing) {
        // Update to admin
        const res = await supabase.from('user_roles').update({ role: 'admin' }).eq('user_id', form.user_id);
        error = res.error;
      } else {
        // Fallback: If for some reason the trigger didn't fire, insert (usually won't happen)
        const res = await supabase.from('user_roles').insert({ user_id: form.user_id, role: 'admin' });
        error = res.error;
      }

      if (error) throw error;
      toast.success('Permissões de Administrador concedidas com sucesso!');
      setOpen(false);
      setForm({ user_id: '' });
      load();
    } catch (err: any) {
      toast.error('Ocorreu um erro: ' + err.message);
    }
  };

  const handleDemote = async (id: string, user_id: string) => {
    if (!confirm('Deseja realmente remover os privilégios de administrador deste usuário? Ele voltará a ser um cliente comum.')) return;
    
    const { error } = await supabase.from('user_roles').update({ role: 'client' }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Privilégios removidos.');
      load();
    }
  };

  const admins = roles.filter(r => r.role === 'admin');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-warning" />
            Administradores
          </h1>
          <p className="text-muted-foreground">Gerencie quem tem acesso total ao painel</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="solar-gradient text-accent">
              <UserPlus className="w-4 h-4 mr-2" /> Promover Administrador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conceder Acesso de Administrador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Para tornar alguém um administrador, esse usuário já precisa ter criado uma conta no sistema (tela de Login / Cadastro). Cole o <strong>ID do Usuário</strong> abaixo.
              </p>
              <div>
                <Label>ID do Usuário (UUID)</Label>
                <Input 
                  placeholder="Ex: 123e4567-e89b-12d3..." 
                  value={form.user_id} 
                  onChange={e => setForm({ user_id: e.target.value })} 
                />
                <p className="text-xs text-muted-foreground mt-1">Você pode encontrar o ID do usuário no Auth Console do Supabase.</p>
              </div>
              <Button onClick={handleMakeAdmin} className="w-full solar-gradient text-accent" disabled={!form.user_id}>
                <ShieldPlus className="w-4 h-4 mr-2" /> Promover a Admin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Equipe de Administradores ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : admins.length === 0 ? (
              <p className="text-muted-foreground">Nenhum administrador encontrado além do root.</p>
            ) : (
              admins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-muted-foreground">ID: {admin.user_id}</span>
                    <Badge variant="outline" className="w-fit mt-1 border-warning/50 text-warning bg-warning/10">Administrador</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDemote(admin.id, admin.user_id)}>
                    <UserMinus className="w-4 h-4 mr-1" /> Rebaixar
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-info/30 bg-info/5">
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-info flex items-center gap-2"><Shield className="w-4 h-4" /> Dica de Segurança</h3>
          <p className="text-sm text-muted-foreground">
            A forma mais fácil de criar novos administradores é pedir para a pessoa entrar no site e clicar em <strong>"Criar nova conta"</strong> com o e-mail dela.
            Depois, você pega o ID gerado para ela no painel do banco de dados (Supabase &gt; Authentication) e promove o acesso dela aqui nesta tela!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
