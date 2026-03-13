import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const colors = {
  orange: '#F97316',
  yellow: '#EAB308',
  white: '#FFFFFF',
  dark: '#0F172A',
  gray: '#475569',
  lightGray: '#F1F5F9',
  border: '#E2E8F0',
  green: '#15803D',
  red: '#B91C1C',
  blue: '#1D4ED8',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontSize: 9,
    color: colors.dark,
    padding: 30,
    fontFamily: 'Helvetica',
  },
  // ── HEADER ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.orange,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.orange,
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 2,
  },
  // ── GRID SYSTEM ──
  grid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
    marginBottom: 8,
  },
  // ── CLIENT DATA ──
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 80,
    color: colors.gray,
    fontWeight: 'normal',
  },
  infoValue: {
    fontWeight: 'bold',
  },
  // ── SUMMARY (LARGE TOTAL) ──
  summaryBox: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    color: colors.gray,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalBox: {
    backgroundColor: colors.orange,
    padding: '10 20',
    borderRadius: 8,
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.white,
    fontSize: 8,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  totalValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  // ── DETALHAMENTO TABLE ──
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.dark,
    padding: '6 10',
    borderRadius: '4 4 0 0',
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '8 10',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  // ── ECONOMIA BLOCK ──
  economyBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  economyTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.green,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  economyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  economyItem: {
    alignItems: 'center',
  },
  economyLabel: {
    fontSize: 7,
    color: colors.gray,
    marginBottom: 2,
  },
  economyValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  savingsHighlight: {
    fontSize: 14,
    color: colors.green,
  },
  // ── PAGAMENTO PIX ──
  pixBox: {
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  qrCode: {
    width: 100,
    height: 100,
    backgroundColor: colors.white,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pixInfo: {
    flex: 1,
    gap: 8,
  },
  pixKeyBox: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pixKey: {
    fontSize: 8,
    fontFamily: 'Courier',
    textAlign: 'center',
  },
  // ── FOOTER ──
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: colors.gray,
  },
});

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const statusLabels: Record<string, string> = {
  pending: 'PENDENTE',
  receipt_sent: 'COMPROVANTE ENVIADO',
  paid: 'PAGO',
  confirmed: 'EFETIVADO',
  overdue: 'VENCIDO',
};

export interface BillPDFProps {
  clientName: string;
  unitName: string;
  month: number;
  year: number;
  dueDate: string;
  injectedKwh: number;
  solarValue: number;
  energisaValue: number;
  totalAmount: number;
  paymentStatus: string;
  pixKey?: string;
  pixQrUrl?: string;
  pixReceiver?: string;
  pricePerKwh?: number;
  utilityTariffUsed?: number;
}

export function BillPDF({
  clientName,
  unitName,
  month,
  year,
  dueDate,
  injectedKwh,
  solarValue,
  energisaValue,
  totalAmount,
  paymentStatus,
  pixKey,
  pixQrUrl,
  pixReceiver,
  pricePerKwh,
  utilityTariffUsed,
}: BillPDFProps) {
  const formattedDue = dueDate
    ? new Date(dueDate + 'T12:00:00').toLocaleDateString('pt-BR')
    : '-';

  const tariff = utilityTariffUsed || 1.13;
  const concessionariaCostEst = Number(injectedKwh) * tariff;
  const totalSavings = concessionariaCostEst - Number(solarValue);

  return (
    <Document title={`Fatura_${clientName}_${monthNames[month-1]}`}>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>SOLCONTROLE</Text>
            <Text style={styles.headerSubtitle}>Gestão Inteligente de Energia Solar</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>FATURA DE SERVIÇOS</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.orange }}>{monthNames[month-1]}/{year}</Text>
          </View>
        </View>

        {/* DADOS DO CLIENTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados de Cobrança</Text>
          <View style={styles.grid}>
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliente:</Text>
                <Text style={styles.infoValue}>{clientName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Unidade:</Text>
                <Text style={styles.infoValue}>{unitName}</Text>
              </View>
            </View>
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Referência:</Text>
                <Text style={styles.infoValue}>{monthNames[month-1]} {year}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vencimento:</Text>
                <Text style={[styles.infoValue, { color: colors.red }]}>{formattedDue}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Situação:</Text>
                <Text style={[styles.infoValue, { color: paymentStatus === 'paid' || paymentStatus === 'confirmed' ? colors.green : colors.red }]}>
                  {statusLabels[paymentStatus] || 'PENDENTE'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* RESUMO DA FATURA */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Energia Solar</Text>
            <Text style={styles.summaryValue}>R$ {Number(solarValue).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Concessionária</Text>
            <Text style={styles.summaryValue}>R$ {Number(energisaValue).toFixed(2)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>R$ {Number(totalAmount).toFixed(2)}</Text>
          </View>
        </View>

        {/* DETALHAMENTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhamento dos Serviços</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Descrição</Text>
              <Text style={styles.tableHeaderText}>Qtd (kWh)</Text>
              <Text style={styles.tableHeaderText}>Tarifa (R$)</Text>
              <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>Valor (R$)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Serviço de Injeção Solar</Text>
              <Text style={styles.tableCell}>{Number(injectedKwh).toFixed(2)}</Text>
              <Text style={styles.tableCell}>{Number(pricePerKwh || 0).toFixed(4)}</Text>
              <Text style={styles.tableCellRight}>{Number(solarValue).toFixed(2)}</Text>
            </View>
            {Number(energisaValue) > 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Taxa de Disponibilidade (Concessionária)</Text>
                <Text style={styles.tableCell}>-</Text>
                <Text style={styles.tableCell}>-</Text>
                <Text style={styles.tableCellRight}>{Number(energisaValue).toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ECONOMIA */}
        <View style={styles.economyBox}>
          <Text style={styles.economyTitle}>Economia com Energia Solar</Text>
          <View style={styles.economyGrid}>
            <View style={styles.economyItem}>
              <Text style={styles.economyLabel}>Custo Sem Solar (Est.)</Text>
              <Text style={[styles.economyValue, { color: colors.red }]}>R$ {concessionariaCostEst.toFixed(2)}</Text>
            </View>
            <View style={styles.economyItem}>
              <Text style={styles.economyLabel}>Seu Custo SolControle</Text>
              <Text style={styles.economyValue}>R$ {Number(solarValue).toFixed(2)}</Text>
            </View>
            <View style={styles.economyItem}>
              <Text style={[styles.economyLabel, { color: colors.green, fontWeight: 'bold' }]}>Economia Total</Text>
              <Text style={[styles.economyValue, styles.savingsHighlight]}>R$ {totalSavings.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* PAGAMENTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instruções de Pagamento</Text>
          <View style={styles.pixBox}>
            <View style={styles.qrCode}>
              {pixQrUrl ? (
                <Image src={pixQrUrl} />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 6, color: colors.gray, textAlign: 'center' }}>Acesse o App para ver o QR Code</Text>
                </View>
              )}
            </View>
            <View style={styles.pixInfo}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.green }}>✓ Pagamento via PIX</Text>
              <View>
                <Text style={{ fontSize: 7, color: colors.gray, marginBottom: 2 }}>CHAVE PIX (Copia e Cola):</Text>
                <View style={styles.pixKeyBox}>
                  <Text style={styles.pixKey}>{pixKey || 'Não disponível'}</Text>
                </View>
              </View>
              {pixReceiver && (
                <View>
                  <Text style={{ fontSize: 7, color: colors.gray, marginBottom: 2 }}>TITULAR:</Text>
                  <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{pixReceiver}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>Documento emitido automaticamente pelo sistema SolControle</Text>
            <Text style={styles.footerText}>Data de emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</Text>
          </View>
          <Text style={[styles.footerText, { fontWeight: 'bold', color: colors.orange }]}>www.solcontrole.com.br</Text>
        </View>
      </Page>
    </Document>
  );
}
