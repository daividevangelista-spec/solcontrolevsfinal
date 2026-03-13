import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, Calendar, Database } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  performed_by: string;
  old_data: any;
  new_data: any;
  created_at: string;
  profiles?: { name: string; email: string } | null;
}

const tableNames: Record<string, string> = {
  energy_bills: 'Faturas',
  clients: 'Clientes',
  consumer_units: 'Unidades',
  payments: 'Pagamentos',
  energy_settings: 'Configurações',
};

const actionColors: Record<string, string> = {
  INSERT: 'bg-success/20 text-success border-success/30',
  UPDATE: 'bg-info/20 text-info border-info/30',
  DELETE: 'bg-destructive/20 text-destructive border-destructive/30',
};

const translateAction = (log: AuditLog) => {
  const table = tableNames[log.table_name] || log.table_name;
  
  if (log.action === 'INSERT') {
    if (log.table_name === 'energy_bills') return 'Criou uma nova fatura';
    if (log.table_name === 'payments') return 'Registrou um novo pagamento';
    return `Criou um registro em ${table}`;
  }
  
  if (log.action === 'UPDATE') {
    if (log.table_name === 'energy_bills') {
      if (log.old_data?.payment_status !== log.new_data?.payment_status) {
        return `Alterou status da fatura para: ${log.new_data?.payment_status}`;
      }
      if (log.new_data?.solar_payment_proof_url && !log.old_data?.solar_payment_proof_url) {
        return 'Enviou comprovante de pagamento';
      }
      return 'Editou valores da fatura';
    }
    return `Atualizou dados em ${table}`;
  }
  
  if (log.action === 'DELETE') return `Removeu registro de ${table}`;
  
  return `${log.action} em ${table}`;
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const fetchedLogs = data || [];
      const userIds = [...new Set(fetchedLogs.map(log => log.performed_by).filter(Boolean))];
      
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
        profiles: log.performed_by ? profilesMap[log.performed_by] : null
      }));

      setLogs(enrichedLogs as any);
    } catch (err: any) {
      toast.error('Erro ao carregar logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-warning" />
            Logs de Auditoria
          </h1>
          <p className="text-muted-foreground">Rastreabilidade completa de todas as ações no sistema</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Carregando histórico...</p>
            ) : logs.length === 0 ? (
              <p className="text-muted-foreground">Nenhum evento registrado ainda.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors">
                  <div className={`p-2 rounded-full border ${actionColors[log.action]}`}>
                    <Database className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">
                        {translateAction(log)}
                      </p>
                      <Badge variant="outline" className="text-[10px] opacity-70">
                        {log.table_name}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.profiles?.name || 'Sistema / Desconhecido'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {/* Show diff for updates if needed - keeping it simple for now */}
                    {log.action === 'UPDATE' && (
                      <div className="mt-2 text-[10px] font-mono bg-background/50 p-2 rounded border border-border/50 max-h-24 overflow-y-auto">
                        <span className="text-info">ID do Registro: {log.record_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-info/30 bg-info/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota de Segurança:</strong> Estes logs são gerados automaticamente pelo banco de dados (Triggers) e não podem ser apagados ou modificados, nem mesmo por outros administradores via interface, garantindo a integridade da auditoria.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
