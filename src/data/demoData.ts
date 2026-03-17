export interface DemoClient {
  id: string;
  nome: string;
  status: 'Ativo' | 'Pendente' | 'Atrasado';
  email: string;
  telefone: string;
}

export interface DemoBill {
  id: string;
  cliente: string;
  valorSolar: number;
  taxas: number;
  total: number;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  vencimento: string;
}

export interface DemoActivity {
  date: string;
  label: string;
  status: 'paid' | 'pending' | 'overdue' | 'generated';
  amount?: string;
}

export const demoKPIs = {
  totalFaturado: 12450.00,
  totalRecebido: 10450.00,
  totalPendente: 1400.00,
  totalVencido: 600.00,
  totalEnergyConsumed: 1250,
  economiaGerada: 8320.00,
  clientesAtivos: 12,
  inadimplencia: 16,
  overdueClients: 3
};

export const demoClients: DemoClient[] = [
  { id: '1', nome: "João Energia Solar", status: "Ativo", email: "joao@exemplo.com", telefone: "(65) 99999-1111" },
  { id: '2', nome: "Maria Sustentável", status: "Pendente", email: "maria@exemplo.com", telefone: "(65) 99999-2222" },
  { id: '3', nome: "Empresa Luz Verde", status: "Atrasado", email: "contato@luzverde.com", telefone: "(65) 99999-3333" },
  { id: '4', nome: "Condomínio Solar", status: "Ativo", email: "admin@condosoalr.com", telefone: "(65) 98888-4444" }
];

export const demoBills: DemoBill[] = [
  { id: 'b1', cliente: "João Energia Solar", valorSolar: 350.00, taxas: 50.00, total: 400.00, status: 'Pendente', vencimento: "2026-03-30" },
  { id: 'b2', cliente: "Maria Sustentável", valorSolar: 700.00, taxas: 80.00, total: 780.00, status: 'Pago', vencimento: "2026-03-15" },
  { id: 'b3', cliente: "Empresa Luz Verde", valorSolar: 1200.00, taxas: 150.00, total: 1350.00, status: 'Atrasado', vencimento: "2026-03-05" },
  { id: 'b4', cliente: "Condomínio Solar", valorSolar: 2450.00, taxas: 300.00, total: 2750.00, status: 'Pago', vencimento: "2026-03-10" }
];

export const demoHistory: DemoActivity[] = [
  { date: "Hoje, 09:30", label: "Fatura enviada para João Energia Solar", status: "generated", amount: "R$ 400,00" },
  { date: "Hoje, 08:45", label: "Pagamento confirmado: Condomínio Solar", status: "paid", amount: "R$ 2.750,00" },
  { date: "Ontem, 14:20", label: "Pagamento confirmado: Maria Sustentável", status: "paid", amount: "R$ 780,00" },
  { date: "05/03/2026", label: "Fatura vencida: Empresa Luz Verde", status: "overdue", amount: "R$ 1.350,00" },
  { date: "01/03/2026", label: "Fatura gerada: Maria Sustentável", status: "generated", amount: "R$ 780,00" }
];

export const demoChartData = [
  { name: 'Jan', injectedEnergy: 800, solarRevenue: 7000, overdueBills: 1, energisaValue: 5000 },
  { name: 'Fev', injectedEnergy: 1050, solarRevenue: 9200, overdueBills: 0, energisaValue: 6200 },
  { name: 'Mar', injectedEnergy: 1250, solarRevenue: 10450, overdueBills: 2, energisaValue: 8100 },
];
