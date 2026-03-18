import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Mail, MessageSquare, Smartphone, Loader2, Save, Shield, User as UserIcon, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
}

export default function ClientSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch Notification Settings
          const { data: notifData } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (notifData) setSettings(notifData as any);

          // Fetch Profile Data
          const { data: profData } = await supabase
            .from('profiles')
            .select('name, phone, address')
            .eq('user_id', user.id)
            .single();

          if (profData) {
            setProfile({
              name: profData.name || '',
              phone: profData.phone || '',
              address: profData.address || ''
            });
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Erro ao carregar dados');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Update Notification Settings
      if (settings) {
        await supabase
          .from('notification_settings')
          .update({
            email_enabled: settings.email_enabled,
            whatsapp_enabled: settings.whatsapp_enabled,
            push_enabled: settings.push_enabled,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }

      // 2. Update Profile (This will trigger SQL sync to 'clients' table)
      const { error: profError } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profError) throw profError;

      toast.success('Perfil atualizado com sucesso');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e conta</p>
        </div>
        <Button onClick={handleUpdate} disabled={saving} className="solar-gradient text-accent font-bold">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-display">Dados Pessoais</CardTitle>
                  <CardDescription>Mantenha seus contatos atualizados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-wider ml-1 opacity-70">Nome Completo</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                  className="bg-background/50 border-border/40 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-wider ml-1 opacity-70">WhatsApp / Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="bg-background/50 border-border/40 focus:border-primary/50"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-display">Endereço de Cobrança</CardTitle>
                  <CardDescription>Local para entrega de faturas físicas (se aplicável)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-[11px] font-black uppercase tracking-wider ml-1 opacity-70">Endereço Completo</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  className="bg-background/50 border-border/40 focus:border-primary/50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-display">Notificações</CardTitle>
                  <CardDescription>Como você deseja ser alertado</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">E-mail</Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Relatórios e faturas</p>
                  </div>
                </div>
                <Switch 
                  checked={settings?.email_enabled} 
                  onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, email_enabled: checked } : null)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">WhatsApp</Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Lembretes rápidos</p>
                  </div>
                </div>
                <Switch 
                  checked={settings?.whatsapp_enabled} 
                  onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, whatsapp_enabled: checked } : null)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Push</Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Alertas diretos</p>
                  </div>
                </div>
                <Switch 
                  checked={settings?.push_enabled} 
                  onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, push_enabled: checked } : null)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Security / Account Placeholder */}
        <Card className="border-border shadow-sm border-dashed bg-muted/5 opacity-60">
          <CardContent className="p-8 text-center space-y-2">
            <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="font-bold text-muted-foreground">Segurança da Conta</p>
            <p className="text-xs text-muted-foreground">Funcionalidade de alteração de senha em breve.</p>
          </CardContent>
        </Card>
    </div>
  );
}
