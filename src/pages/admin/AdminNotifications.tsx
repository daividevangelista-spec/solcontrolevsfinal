import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2, XCircle, Clock, Mail, MessageSquare, Smartphone, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationLog {
  id: string;
  user_id: string;
  channel: 'email' | 'whatsapp' | 'push';
  type: string;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
  profiles?: { name: string; email: string } | null;
}

const typeMap: Record<string, string> = {
  bill_generated: 'Nova Fatura Gerada',
  payment_confirmed: 'Pagamento Confirmado',
  bill_reminder_3d: 'Lembrete (3 Dias p/ Vencer)',
  bill_overdue: 'Aviso de Atraso',
};

const channelIcons = {
  email: <Mail className="w-4 h-4 text-blue-500" />,
  whatsapp: <MessageSquare className="w-4 h-4 text-green-500" />,
  push: <Smartphone className="w-4 h-4 text-purple-500" />
};

export default function AdminNotifications() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, sent: 0, failed: 0 });

  const load = async () => {
    setLoading(true);
    
    // Fetch logs
    const { data: logData, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast.error('Erro ao carregar logs de notificação');
      setLoading(false);
      return;
    }

    const fetchedLogs = logData || [];
    const userIds = [...new Set(fetchedLogs.map(log => log.user_id).filter(Boolean))];
    
    let profilesMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);
        
      if (profilesData) {
        profilesData.forEach(p => profilesMap[p.user_id] = p);
      }
    }

    const enrichedLogs = fetchedLogs.map(log => ({
      ...log,
      profiles: log.user_id ? profilesMap[log.user_id] : null
    }));

    setLogs(enrichedLogs as any);

    // Calculate stats
    const newStats = { pending: 0, sent: 0, failed: 0 };
    enrichedLogs.forEach(l => {
      if (l.status === 'pending') newStats.pending++;
      if (l.status === 'sent') newStats.sent++;
      if (l.status === 'failed') newStats.failed++;
    });
    setStats(newStats);

    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const manualTrigger = async () => {
    toast.loading('Iniciando processamento manual...', { id: 'manual-trigger' });
    try {
      console.log("Obtendo sessão para autenticação...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada. Por favor, faça login novamente.');
      }

      console.log("Invocando Edge Function: send-notifications...");
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: {}
      });
      
      if (error) {
        console.error("Erro retornado pela Function:", error);
        const status = (error as any).status || 500;
        if (status === 401) {
          throw new Error('Não autorizado (401). Verifique se o JWT está ativado no Dashboard ou se o token expirou.');
        }
        throw new Error(error.message || 'Erro ao processar notificações.');
      }
      
      console.log("Resposta da Function:", data);
      toast.success(`Sucesso! Processadas ${data?.processed || 0} notificações.`, { id: 'manual-trigger' });
      load();
    } catch (err: any) {
      console.error('Erro manualTrigger:', err);
      toast.error('Erro ao processar: ' + (err.message || 'Erro desconhecido'), { id: 'manual-trigger', duration: 6000 });
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Status de Notificações</h2>
          <p className="text-sm text-muted-foreground">Monitore o disparo automático de E-mails e Alertas</p>
        </div>
        <button 
          onClick={manualTrigger}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold hover:bg-emerald-500/20 transition text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Forçar Processamento da Fila
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Na Fila (Aguardando)</p>
            <p className="text-3xl font-display font-black text-warning">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Enviados com Sucesso</p>
            <p className="text-3xl font-display font-black text-success">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Falhas (Erro API)</p>
            <p className="text-3xl font-display font-black text-destructive">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            Últimos Disparos (Log)
          </CardTitle>
          <CardDescription>Eventos gerados pelo sistema, incluindo Cron Jobs de Lembrete.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center py-4 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></p>
            ) : logs.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Nenhuma notificação registrada ainda.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border bg-card gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/30 rounded-full">
                      {channelIcons[log.channel] || <Bell className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{typeMap[log.type] || log.type}</p>
                      <p className="text-xs text-muted-foreground">Para: {log.profiles?.name || log.user_id}</p>
                      {log.error_message && (
                        <p className="text-[10px] text-destructive mt-1 font-mono bg-destructive/10 p-1 rounded inline-block cursor-help" title={log.error_message}>Erro: Ver Detalhes (Hover)</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    {log.status === 'pending' && <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20"><Clock className="w-3 h-3 mr-1"/> Na Fila</Badge>}
                    {log.status === 'sent' && <Badge variant="outline" className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Enviado</Badge>}
                    {log.status === 'failed' && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1"/> Falhou</Badge>}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
