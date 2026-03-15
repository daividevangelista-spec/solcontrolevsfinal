import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Zap, FileText, Clock, CheckCircle, 
  AlertTriangle, TrendingUp, DollarSign, Plus, 
  ArrowUpRight, BarChart3, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';
import { motion } from 'framer-motion';
import { DashboardHero } from '@/components/DashboardHero';
import { RefinedStat } from '@/components/RefinedStat';
import { ActivityTimeline } from '@/components/ActivityTimeline';

interface Metrics {
  totalClients: number;
  totalUnits: number;
  totalBills: number;
  pendingBills: number;
  paidBills: number;
  overdueBills: number;
  totalEnergyConsumed: number;
  totalFaturado: number;
  totalRecebido: number;
  totalPendente: number;
  totalVencido: number;
  overdueClients: number;
}

interface ChartData {
  name: string;
  injectedEnergy: number;
  solarRevenue: number;
  overdueBills: number;
  energisaValue: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalClients: 0, totalUnits: 0, totalBills: 0, pendingBills: 0,
    paidBills: 0, overdueBills: 0, totalEnergyConsumed: 0, 
    totalFaturado: 0, totalRecebido: 0, totalPendente: 0, totalVencido: 0, overdueClients: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [clients, units, bills] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('consumer_units').select('id', { count: 'exact', head: true }),
        supabase.from('energy_bills').select('*, consumer_units(client_id)'),

      ]);

      const allBills = (bills.data as any[]) || [];
      const pendingBills = allBills.filter(b => b.payment_status === 'pending');
      const paidBills = allBills.filter(b => b.payment_status === 'paid' || b.payment_status === 'confirmed');
      const overdueBills = allBills.filter(b => b.payment_status === 'overdue');
      const overdueClientIds = new Set(overdueBills.map(b => b.consumer_units?.client_id).filter(Boolean));

      setMetrics({
        totalClients: clients.count || 0,
        totalUnits: units.count || 0,
        totalBills: allBills.length,
        pendingBills: pendingBills.length,
        paidBills: paidBills.length,
        overdueBills: overdueBills.length,
        totalEnergyConsumed: allBills.reduce((sum, b) => sum + Number(b.injected_energy_kwh || b.consumption_kwh || 0), 0),
        totalFaturado: allBills.reduce((sum, b) => sum + Number(b.solar_energy_value || b.total_amount || 0), 0),
        totalRecebido: paidBills.reduce((sum, b) => sum + Number(b.solar_energy_value || b.total_amount || 0), 0),
        totalPendente: pendingBills.reduce((sum, b) => sum + Number(b.solar_energy_value || b.total_amount || 0), 0),
        totalVencido: overdueBills.reduce((sum, b) => sum + Number(b.solar_energy_value || b.total_amount || 0), 0),
        overdueClients: overdueClientIds.size,
      });

      // Calculate Chart Data (Last 6 Months up to latest bill)
      const last6MonthsData: Record<string, ChartData> = {};
      const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      let refYear = new Date().getFullYear();
      let refMonth = new Date().getMonth() + 1;
      
      if (allBills.length > 0) {
        const sorted = [...allBills].sort((a,b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
        refYear = sorted[0].year;
        refMonth = sorted[0].month;
      }
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(refYear, refMonth - 1 - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const key = `${y}-${m}`;
        last6MonthsData[key] = {
          name: `${monthsShort[m-1]}/${String(y).slice(2)}`,
          injectedEnergy: 0,
          solarRevenue: 0,
          overdueBills: 0,
          energisaValue: 0
        };
      }

      allBills.forEach((b: any) => {
        const key = `${b.year}-${b.month}`;
        if (last6MonthsData[key]) {
          last6MonthsData[key].injectedEnergy += Number(b.injected_energy_kwh || b.consumption_kwh || 0);
          
          if (b.payment_status === 'paid' || b.payment_status === 'confirmed') {
            last6MonthsData[key].solarRevenue += Number(b.solar_energy_value || b.total_amount || 0);
          }
          
          if (b.payment_status === 'overdue') {
            last6MonthsData[key].overdueBills += 1;
          }
          last6MonthsData[key].energisaValue += Number(b.energisa_bill_value || b.concessionaria_value || 0);
        }
      });

      setChartData(Object.values(last6MonthsData));
    };
    load();
  }, []);

  const analyticsCards = [
    { label: 'Total Faturado', value: `R$ ${metrics.totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-amber-500' },
    { label: 'Total Recebido', value: `R$ ${metrics.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Total Pendente', value: `R$ ${metrics.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Clock, color: 'text-amber-600' },
    { label: 'Total Vencido', value: `R$ ${metrics.totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: AlertTriangle, color: 'text-rose-500' },
    { label: 'Total Injetado (kWh)', value: `${metrics.totalEnergyConsumed.toLocaleString('pt-BR')} kWh`, icon: Zap, color: 'text-amber-400' },
    { label: 'Clientes em Atraso', value: metrics.overdueClients, icon: Users, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardHero 
        highlights={[
          { label: 'Total Recebido', value: `R$ ${metrics.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign },
          { label: 'Total Faturado', value: `R$ ${metrics.totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp },
          { label: 'Total Vencido', value: `R$ ${metrics.totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: AlertTriangle },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-2xl font-display font-black text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Visão Geral do Sistema
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Controle em tempo real de toda a operação solar.</p>
        </div>
        <Button onClick={() => navigate('/admin/bills')} className="saas-button premium-gradient text-white h-12 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40">
          <Plus className="w-5 h-5 mr-1" /> Gerar Nova Fatura
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Clientes", value: metrics.totalClients, icon: Users, color: "text-info" },
          { label: "Unidades", value: metrics.totalUnits, icon: Zap, color: "text-warning" },
          { label: "Total Faturas", value: metrics.totalBills, icon: FileText, color: "text-foreground" },
          { label: "Pendentes", value: metrics.pendingBills, icon: Clock, color: "text-warning" },
          { label: "Pagas", value: metrics.paidBills, icon: CheckCircle, color: "text-success" },
          { label: "Vencidas", value: metrics.overdueBills, icon: AlertTriangle, color: "text-destructive" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card border-white/10 dark:border-white/5 hover:border-primary/40 transition-all p-4 solar-border-glow">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted/30">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                  <p className="text-lg font-display font-black">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 px-1">Indicadores Financeiros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsCards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Card className="glass-card border-white/10 dark:border-white/5 hover:border-primary/30 transition-all group overflow-hidden">
                <CardContent className="p-5 flex items-center gap-5 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 solar-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity blur-3xl -mr-12 -mt-12" />
                  <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">{card.label}</p>
                    <p className="text-xl font-display font-black text-foreground truncate">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-display font-bold text-foreground mb-3">Gráficos de Desempenho (Últimos 6 meses)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Solar Injected */}
          <Card className="glass-card border-white/10 dark:border-white/5 hover:border-primary/40 transition-all p-0 overflow-hidden solar-border-glow">
            <CardHeader className="pb-0 px-6 pt-6">
              <CardTitle className="font-display text-xl font-black flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                Energia Injetada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="injectedEnergy" name="Solar Injetada (kWh)" stroke="hsl(var(--primary))" strokeWidth={4} fill="url(#colorInjected)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Solar Revenue */}
          <Card className="glass-card border-white/10 dark:border-white/5 hover:border-primary/40 transition-all p-0 overflow-hidden solar-border-glow">
            <CardHeader className="pb-0 px-6 pt-6">
              <CardTitle className="font-display text-xl font-black flex items-center gap-2">
                <div className="p-2 rounded-xl bg-success/10">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                Receita Estimada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', color: '#fff' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                    />
                    <Bar dataKey="solarRevenue" name="Receita" fill="url(#colorRev)" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3: Overdue Bills */}
          <Card className="saas-card overflow-hidden">
            <CardHeader className="pb-0 px-6 pt-6">
              <CardTitle className="font-display text-xl font-black flex items-center gap-2">
                <div className="p-2 rounded-xl bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                Inadimplência Mensal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '800' }}
                    />
                    <Bar dataKey="overdueBills" name="Faturas Vencidas" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 4: Solar Injected vs Energisa Bill Value */}
          <Card className="saas-card overflow-hidden">
            <CardHeader className="pb-0 px-6 pt-6">
              <CardTitle className="font-display text-xl font-black flex items-center gap-2">
                <div className="p-2 rounded-xl bg-info/10">
                  <BarChart3 className="w-5 h-5 text-info" />
                </div>
                Eficiência: Injetado vs Reais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEnergisaAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontVariant: '700', fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '800' }}
                    />
                    <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingBottom: '20px' }} />
                    <Area type="monotone" dataKey="injectedEnergy" name="Solar Injetada (kWh)" stroke="#f59e0b" strokeWidth={3} fill="url(#colorInjected)" />
                    <Area type="monotone" dataKey="energisaValue" name="Valor Energisa (R$)" stroke="#0ea5e9" strokeWidth={3} fill="url(#colorEnergisaAdmin)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
