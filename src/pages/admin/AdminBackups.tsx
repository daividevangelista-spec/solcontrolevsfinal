import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Database, FileJson, FileSpreadsheet, History, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToJson, exportToCsv } from '@/lib/exportUtils';

interface BackupRecord {
  id: string;
  created_at: string;
  filename: string;
  file_type: string;
  record_count: number;
  file_size_kb: number;
  profiles?: { name: string } | null;
}

export default function AdminBackups() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadHistory = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Erro ao carregar histórico de backups');
    } else {
      const backupsList = data || [];
      const userIds = [...new Set(backupsList.map(b => b.created_by).filter(Boolean))];
      
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', userIds);
          
        if (profilesData) {
          profilesData.forEach(p => profilesMap[p.user_id] = p);
        }
      }

      const enrichedBackups = backupsList.map(b => ({
        ...b,
        profiles: b.created_by ? profilesMap[b.created_by] : null
      }));

      setBackups(enrichedBackups as any);
    }
    setFetching(false);
  };

  useEffect(() => { loadHistory(); }, []);

  const triggerFullBackup = async () => {
    setLoading(true);
    try {
      // Fetch all critical data
      const [clients, units, bills, payments, settings] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('consumer_units').select('*'),
        supabase.from('energy_bills').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('energy_settings').select('*'),
      ]);

      const backupData = {
        exported_at: new Date().toISOString(),
        data: {
          clients: clients.data || [],
          consumer_units: units.data || [],
          energy_bills: bills.data || [],
          payments: payments.data || [],
          energy_settings: settings.data || [],
        }
      };

      const totalRecords = 
        (clients.data?.length || 0) + 
        (units.data?.length || 0) + 
        (bills.data?.length || 0) + 
        (payments.data?.length || 0);

      const { filename, sizeKb } = exportToJson(backupData, 'full_system');

      // Record in DB
      const { error: dbErr } = await supabase.from('backups').insert({
        filename,
        file_type: 'json',
        record_count: totalRecords,
        file_size_kb: sizeKb,
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (dbErr) throw dbErr;

      toast.success('Backup completo gerado com sucesso!');
      loadHistory();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao gerar backup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportTable = async (tableName: string, format: 'json' | 'csv') => {
    try {
      toast.loading(`Exportando ${tableName}...`);
      const { data, error } = await supabase.from(tableName as any).select('*');
      if (error) throw error;

      if (format === 'json') {
        exportToJson(data, tableName);
      } else {
        exportToCsv(data, tableName);
      }
      toast.dismiss();
      toast.success(`${tableName} exportado com sucesso!`);
    } catch (err: any) {
      toast.dismiss();
      toast.error(`Erro ao exportar ${tableName}: ` + err.message);
    }
  };

  const deleteBackupRecord = async (id: string) => {
    if (!confirm('Deseja remover este registro do histórico? (O arquivo baixado não será afetado)')) return;
    const { error } = await supabase.from('backups').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir registro');
    else {
      toast.success('Registro removido');
      loadHistory();
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Backup & Exportação</h1>
          <p className="text-muted-foreground">Gerencie a segurança e portabilidade dos seus dados.</p>
        </div>
        <Button 
          onClick={triggerFullBackup} 
          disabled={loading}
          className="solar-gradient text-accent font-bold h-11"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
          Gerar Backup Completo (JSON)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              Histórico de Backups
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadHistory} disabled={fetching}>
              {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Arquivo / Tipo</th>
                    <th className="px-4 py-3">Registros</th>
                    <th className="px-4 py-3">Tamanho</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {backups.length === 0 && !fetching && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum backup registrado.</td>
                    </tr>
                  )}
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        {new Date(b.created_at).toLocaleString('pt-BR')}
                        <p className="text-[10px] text-muted-foreground font-normal">Por: {b.profiles?.name || 'Sistema'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {b.file_type === 'json' ? <FileJson className="w-4 h-4 text-warning" /> : <FileSpreadsheet className="w-4 h-4 text-success" />}
                          <span className="truncate max-w-[150px]" title={b.filename}>{b.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{b.record_count} itens</td>
                      <td className="px-4 py-3">{b.file_size_kb} KB</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteBackupRecord(b.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-display">Exportação Rápida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clientes</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-9" onClick={() => exportTable('clients', 'json')}>JSON</Button>
                  <Button variant="outline" size="sm" className="h-9" onClick={() => exportTable('clients', 'csv')}>CSV</Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Faturas</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-9" onClick={() => exportTable('energy_bills', 'json')}>JSON</Button>
                  <Button variant="outline" size="sm" className="h-9" onClick={() => exportTable('energy_bills', 'csv')}>CSV</Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pagamentos</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-9" onClick={() => exportTable('payments', 'json')}>JSON</Button>
                  <Button variant="outline" size="sm" className="h-9" onClick={() => exportTable('payments', 'csv')}>CSV</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-info/5 border border-info/20 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-info" />
            </div>
            <div>
              <p className="text-xs font-bold text-info">Dica de Segurança</p>
              <p className="text-[10px] text-info/80 mt-1 leading-relaxed">
                Recomenda-se gerar um backup completo pelo menos uma vez por semana e armazená-lo em local seguro fora do navegador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
