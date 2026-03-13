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
  gray: '#64748B',
  lightGray: '#F8FAFC',
  border: '#E2E8F0',
  green: '#22C55E',
  red: '#EF4444',
  blue: '#3B82F6',
  amber: '#F59E0B',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontSize: 10,
    color: colors.dark,
    padding: 0,
  },
  header: {
    backgroundColor: colors.orange,
    padding: '20 36 18 36',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sunIcon: {
    width: 36,
    height: 36,
    backgroundColor: colors.yellow,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunText: {
    fontSize: 18,
    color: colors.white,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerRightLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRightValue: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.white,
    marginTop: 2,
  },
  body: {
    padding: '16 36 8 36',
    gap: 10,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: '10 12',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    fontSize: 8,
    color: colors.gray,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.dark,
  },
  infoValueSm: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.dark,
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.dark,
    padding: '8 14',
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  tableHeaderTextRight: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'right',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '10 14',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tableCellLabel: {
    flex: 1,
    fontSize: 10,
    color: colors.dark,
  },
  tableCellValue: {
    flex: 1,
    fontSize: 10,
    color: colors.dark,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    padding: '12 14',
    backgroundColor: '#FEF9EE',
    borderTopWidth: 2,
    borderTopColor: colors.orange,
    alignItems: 'center',
  },
  totalLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
    color: colors.orange,
  },
  totalValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: 700,
    color: colors.orange,
    textAlign: 'right',
  },
  pixSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: '10 14',
    alignItems: 'center',
  },
  pixTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#15803D',
    marginBottom: 6,
    textAlign: 'center',
  },
  pixKeyContainer: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: '8 15',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
    marginBottom: 6,
    minWidth: '60%',
    alignItems: 'center',
  },
  pixKey: {
    fontSize: 8, // Further reduced for very long keys
    fontWeight: 700,
    color: colors.dark,
    textAlign: 'center',
  },
  qrCode: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  pixNote: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 10,
    lineHeight: 1.4,
    textAlign: 'center',
  },
  statusBadge: {
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savingsSection: {
    backgroundColor: '#F0F9FF',
    padding: '8 12',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 6,
  },
  savingsTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#0369A1',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  savingsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savingsItem: {
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 7,
    color: '#0369A1',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  savingsValue: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.dark,
  },
  footer: {
    padding: '10 36',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: colors.gray,
  },
  footerBrand: {
    fontSize: 8,
    color: colors.orange,
    fontWeight: 700,
  },
});

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FEF9C3', text: '#A16207', label: 'Pendente' },
  receipt_sent: { bg: '#DBEAFE', text: '#1E40AF', label: 'Comprovante Enviado' },
  awaiting_confirmation: { bg: '#F3E8FF', text: '#7E22CE', label: 'Aguardando Confirmação' },
  paid:    { bg: '#DCFCE7', text: '#15803D', label: 'Paga' },
  confirmed: { bg: '#D1FAE5', text: '#065F46', label: 'Confirmada (Baixa OK)' },
  overdue: { bg: '#FEE2E2', text: '#B91C1C', label: 'Vencida' },
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
  const status = statusConfig[paymentStatus] ?? statusConfig.pending;
  const formattedDue = dueDate
    ? new Date(dueDate + 'T12:00:00').toLocaleDateString('pt-BR')
    : '-';

  const tariff = utilityTariffUsed || 1.13;
  const estUtilityCostTotal = Number(injectedKwh) * tariff;
  const totalSavings = estUtilityCostTotal - Number(solarValue);

  return (
    <Document title={`Fatura_${clientName}_${monthNames[month-1]}`}>
      <Page size="A4" style={styles.page}>
        {/* ──── HEADER ──── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.sunIcon}>
              <Text style={styles.sunText}>☀</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>SolControle</Text>
              <Text style={styles.headerSubtitle}>Gestão de Energia Solar</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerRightLabel}>Referência</Text>
            <Text style={styles.headerRightValue}>
              {monthNames[month - 1]}/{year}
            </Text>
          </View>
        </View>

        {/* ──── BODY ──── */}
        <View style={styles.body}>

          {/* Client & Unit Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Cliente</Text>
                <Text style={styles.infoValue}>{clientName}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>UC</Text>
                <Text style={styles.infoValueSm}>{unitName}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Vencimento</Text>
                <Text style={styles.infoValue}>{formattedDue}</Text>
              </View>
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: status.bg, borderColor: 'transparent' }
                ]}
              >
                <Text style={styles.infoLabel}>Situação</Text>
                <Text style={[styles.infoValue, { color: status.text }]}>
                  {status.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Values Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhamento Financeiro</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Descrição dos Serviços</Text>
                <Text style={styles.tableHeaderTextRight}>Valor (R$)</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>
                  ☀ Energia Injetada ({Number(injectedKwh).toFixed(2)} kWh
                  {pricePerKwh ? ` × R$ ${Number(pricePerKwh).toFixed(4)}` : ''})
                </Text>
                <Text style={styles.tableCellValue}>
                  {Number(solarValue).toFixed(2)}
                </Text>
              </View>

              {Number(energisaValue) > 0 && (
                <View style={[styles.tableRow, styles.tableRowAlt]}>
                  <Text style={styles.tableCellLabel}>
                    ⚡ Taxa Mínima / Disponibilidade (Concessionária)
                  </Text>
                  <Text style={styles.tableCellValue}>
                    {Number(energisaValue).toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL A PAGAR (SolControle + Concessionária)</Text>
                <Text style={styles.totalValue}>
                  R$ {Number(totalAmount).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Savings Comparison */}
            <View style={styles.savingsSection}>
              <Text style={styles.savingsTitle}>📉 Comparativo de Economia (Transparência SolControle)</Text>
              <View style={styles.savingsGrid}>
                <View style={[styles.savingsItem, { alignItems: 'flex-start' }]}>
                  <Text style={[styles.savingsLabel, { color: colors.red }]}>Custo na Concessionária (Est.)</Text>
                  <Text style={[styles.savingsValue, { color: colors.red }]}>R$ {estUtilityCostTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.savingsItem}>
                  <Text style={styles.savingsLabel}>Seu Custo SolControle</Text>
                  <Text style={styles.savingsValue}>R$ {Number(solarValue).toFixed(2)}</Text>
                </View>
                <View style={[styles.savingsItem, { borderLeftWidth: 1, borderLeftColor: '#BAE6FD', paddingLeft: 15 }]}>
                  <Text style={[styles.savingsLabel, { color: colors.green, fontWeight: 700 }]}>Sua Economia Real</Text>
                  <Text style={[styles.savingsValue, { color: colors.green }]}>R$ {totalSavings.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* PIX Payment */}
          {pixKey && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instruções para Pagamento</Text>
              <View style={styles.pixSection}>
                <Text style={styles.pixTitle}>💚 Pague com PIX — Atendimento Prioritário</Text>
                
                <View style={[styles.pixKeyContainer, { paddingHorizontal: 20 }]}>
                  <Text style={styles.infoLabel}>Chave PIX (Copie e Cole)</Text>
                  <Text style={styles.pixKey}>
                    {pixKey}
                  </Text>
                </View>

                {pixReceiver && (
                  <View style={{ marginTop: 2, marginBottom: 8 }}>
                    <Text style={[styles.infoLabel, { textAlign: 'center' }]}>Destinatário (Titular)</Text>
                    <Text style={{ fontSize: 9, fontWeight: 700, color: colors.dark, textAlign: 'center' }}>
                      {pixReceiver}
                    </Text>
                  </View>
                )}

                {/* QR Code */}
                <View style={{ alignItems: 'center', marginTop: 5 }}>
                  <Text style={[styles.infoLabel, { marginBottom: 8 }]}>Ou aponte a câmera do banco para o QR Code:</Text>
                  {pixQrUrl ? (
                    <View style={{ backgroundColor: '#FFF', padding: 5, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' }}>
                      <Image src={pixQrUrl} style={{ width: 80, height: 80 }} />
                    </View>
                  ) : (
                    <View style={{ width: 80, height: 80, backgroundColor: '#FFF', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 7, color: '#999' }}>QR Code disponível no App SolControle</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.pixNote}>
                  Importante: O pagamento deve ser realizado até a data de vencimento.{'\n'}
                  Após concluir, anexe o comprovante no seu painel SolControle para agilizar a baixa.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ──── FOOTER ──── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Emitido em {new Date().toLocaleDateString('pt-BR')} via plataforma SolControle.
          </Text>
          <Text style={styles.footerBrand}>☀ SolControle</Text>
        </View>
      </Page>
    </Document>
  );
}
