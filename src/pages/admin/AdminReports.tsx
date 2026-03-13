import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Zap, 
  Users, 
  AlertCircle, 
  Download, 
  BarChart3, 
  PieChart, 
  Calendar,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { toast } from 'sonner';
import { exportToCsv, exportToJson } from '@/lib/exportUtils';

interface ReportStats {
  totalInjectedKwh: number;
  avgKwhPerClient: number;
  totalRevenue: number;
  avgRevenuePerClient: number;
  activeClients: number;
  overdueClients: number;
  overdueAmount: number;
  totalSavings: number;
  avgSavingsPerClient: number;
}

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [stats, setStats] = useState<ReportStats>({
    totalInjectedKwh: 0,
    avgKwhPerClient: 0,
    totalRevenue: 0,
    avgRevenuePerClient: 0,
    activeClients: 0,
    overdueClients: 0,
    overdueAmount: 0,
    totalSavings: 0,
    avgSavingsPerClient: 0
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [selectedYear]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Energy Bills for the selected year
      const { data: bills, error: billsError } = await supabase
        .from('energy_bills')
        .select(`
          *,
          consumer_units (
            client_id
          )
        `)
        .eq('year', parseInt(selectedYear));

      if (billsError) throw billsError;

      // 2. Fetch Active Clients
      const { count: clientCount, error: clientError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (clientError) throw clientError;

      // 3. Process Stats
      const activeClients = clientCount || 0;
      let totalKwh = 0;
      let totalRevenue = 0;
      let totalSavings = 0;
      let overdueCount = 0;
      let overdueAmount = 0;
      const overdueClientIds = new Set();

      const monthlyMap = new Map();
      // Initialize months
      for (let i = 1; i <= 12; i++) {
        monthlyMap.set(i, { month: i, revenue: 0, energy: 0, savings: 0 });
      }

      bills?.forEach(bill => {
        const kwh = bill.injected_energy_kwh || 0;
        const revenue = bill.total_amount || 0;
        
        // Mocking savings based on standard tariff if available, or 20% default
        // In a real scenario, we'd use energy_settings.standard_utility_tariff
        const estSavings = revenue * 0.25; 

        totalKwh += kwh;
        totalRevenue += revenue;
        totalSavings += estSavings;

        if (bill.payment_status === 'overdue') {
          overdueAmount += revenue;
          overdueClientIds.add(bill.consumer_units?.client_id);
        }

        const mData = monthlyMap.get(bill.month);
        if (mData) {
          mData.revenue += revenue;
          mData.energy += kwh;
          mData.savings += estSavings;
        }
      });

      overdueCount = overdueClientIds.size;

      setStats({
        totalInjectedKwh: totalKwh,
        avgKwhPerClient: activeClients > 0 ? totalKwh / activeClients : 0,
        totalRevenue: totalRevenue,
        avgRevenuePerClient: activeClients > 0 ? totalRevenue / activeClients : 0,
        activeClients: activeClients,
        overdueClients: overdueCount,
        overdueAmount: overdueAmount,
        totalSavings: totalSavings,
        avgSavingsPerClient: activeClients > 0 ? totalSavings / activeClients : 0
      });

      const chartData = Array.from(monthlyMap.values()).map(d => ({
        ...d,
        name: new Date(2000, d.month - 1).toLocaleString('pt-BR', { month: 'short' })
      }));
      setMonthlyData(chartData);

    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error('Erro ao carregar relatório: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: 'csv' | 'json') => {
    const dataToExport = monthlyData.map(d => ({
      Mes: d.name,
      Receita: d.revenue.toFixed(2),
      Energia_kWh: d.energy.toFixed(2),
      Economia_Clientes: d.savings.toFixed(2)
    }));

    if (type === 'csv') exportToCsv(dataToExport, `relatorio_solcontrole_${selectedYear}`);
    else exportToJson(dataToExport, `relatorio_solcontrole_${selectedYear}`);
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Desempenho operacional e financeiro do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] bg-card">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Energia Injetada</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalInjectedKwh.toLocaleString()} kWh</h3>
                <p className="text-xs text-muted-foreground mt-1">Média: {stats.avgKwhPerClient.toFixed(1)} kWh/cli</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <h3 className="text-2xl font-bold mt-1">R$ {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                <p className="text-xs text-muted-foreground mt-1">Média: R$ {stats.avgRevenuePerClient.toFixed(2)}/cli</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Economia Gerada</p>
                <h3 className="text-2xl font-bold mt-1">R$ {stats.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                <p className="text-xs text-muted-foreground mt-1">Média: R$ {stats.avgSavingsPerClient.toFixed(2)}/cli</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inadimplência</p>
                <h3 className="text-2xl font-bold mt-1">R$ {stats.overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                <p className="text-xs text-amber-600 font-bold mt-1">{stats.overdueClients} clientes em atraso</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" /> Receita Mensal
            </CardTitle>
            <CardDescription>Evolução do faturamento total por mês</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`R$ ${value.toLocaleString()}`, 'Receita']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" /> Produção de Energia
            </CardTitle>
            <CardDescription>Total de kWh injetados na rede mensalmente</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `${val}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value.toLocaleString()} kWh`, 'Energia']}
                />
                <Bar dataKey="energy" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table or Secondary Stats */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Resumo Operacional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <p className="text-xl font-bold">{stats.activeClients}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eficiência Média</p>
                <p className="text-xl font-bold">{(stats.totalInjectedKwh / 1000 || 0).toFixed(1)} MWh</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impacto Ambiental</p>
                <p className="text-xl font-bold">{(stats.totalInjectedKwh * 0.5 / 1000).toFixed(1)} tCO2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
