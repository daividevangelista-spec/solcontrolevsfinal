import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Smartphone, Loader2, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
}

export default function ClientSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Erro ao carregar configurações:', error);
            toast.error('Erro ao carregar configurações');
          } else {
            setSettings(data as any);
          }
          setLoading(false);
        });
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user || !settings) return;
    setSaving(true);
    const { error } = await supabase
      .from('notification_settings')
      .update({
        email_enabled: settings.email_enabled,
        whatsapp_enabled: settings.whatsapp_enabled,
        push_enabled: settings.push_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao salvar settings:', error);
      toast.error('Erro ao salvar preferências');
    } else {
      toast.success('Preferências salvas com sucesso');
    }
    setSaving(false);
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

      <div className="grid gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-display">Preferências de Notificação</CardTitle>
                <CardDescription>Escolha como você deseja receber alertas de faturas e pagamentos</CardDescription>
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
                  <Label className="text-base font-bold">E-mail</Label>
                  <p className="text-xs text-muted-foreground font-medium">Resumo de faturas e confirmações de pagamento</p>
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
                  <Label className="text-base font-bold">WhatsApp</Label>
                  <p className="text-xs text-muted-foreground font-medium">Lembretes rápidos de vencimento e faturas</p>
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
                  <Label className="text-base font-bold">Notificações Push</Label>
                  <p className="text-xs text-muted-foreground font-medium">Alertas diretos no seu celular ou navegador</p>
                </div>
              </div>
              <Switch 
                checked={settings?.push_enabled} 
                onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, push_enabled: checked } : null)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security / Account Placeholder */}
        <Card className="border-border shadow-sm border-dashed bg-muted/5 opacity-60">
          <CardContent className="p-8 text-center space-y-2">
            <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="font-bold text-muted-foreground">Segurança da Conta</p>
            <p className="text-xs text-muted-foreground">Funcionalidade de alteração de senha em breve.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
