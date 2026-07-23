import { Transaction, Wallet, WalletStats } from '../types/finance';

interface ExportData {
  userEmail?: string;
  periodLabel: string;
  wallets: WalletStats[];
  transactions: Transaction[];
  exportType: 'single_month' | 'selected_months' | 'six_months';
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateXmlReport(data: ExportData): string {
  const { userEmail, periodLabel, wallets, transactions, exportType } = data;

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') totalIncome += tx.amount;
    if (tx.type === 'expense') totalExpense += tx.amount;
  });

  const walletMap = new Map<string, string>();
  wallets.forEach((w) => walletMap.set(w.wallet.id, w.wallet.name));

  const xmlLines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<finance_report generated_at="${new Date().toISOString()}" export_type="${exportType}" period="${escapeXml(periodLabel)}">`,
    '  <metadata>',
    `    <user_email>${escapeXml(userEmail || 'anonymous')}</user_email>`,
    `    <period>${escapeXml(periodLabel)}</period>`,
    `    <exported_at>${new Date().toLocaleString()}</exported_at>`,
    '  </metadata>',
    '  <summary>',
    `    <total_income>${totalIncome.toFixed(2)}</total_income>`,
    `    <total_expense>${totalExpense.toFixed(2)}</total_expense>`,
    `    <net_savings>${(totalIncome - totalExpense).toFixed(2)}</net_savings>`,
    `    <transaction_count>${transactions.length}</transaction_count>`,
    '  </summary>',
    '  <wallets>',
  ];

  wallets.forEach((w) => {
    xmlLines.push('    <wallet>');
    xmlLines.push(`      <id>${escapeXml(w.wallet.id)}</id>`);
    xmlLines.push(`      <name>${escapeXml(w.wallet.name)}</name>`);
    xmlLines.push(`      <type>${escapeXml(w.wallet.type)}</type>`);
    xmlLines.push(`      <initial_balance>${w.initialBalance.toFixed(2)}</initial_balance>`);
    xmlLines.push(`      <total_income>${w.totalIncome.toFixed(2)}</total_income>`);
    xmlLines.push(`      <total_expense>${w.totalExpense.toFixed(2)}</total_expense>`);
    xmlLines.push(`      <transfers_in>${w.transfersIn.toFixed(2)}</transfers_in>`);
    xmlLines.push(`      <transfers_out>${w.transfersOut.toFixed(2)}</transfers_out>`);
    xmlLines.push(`      <current_balance>${w.currentBalance.toFixed(2)}</current_balance>`);
    xmlLines.push('    </wallet>');
  });

  xmlLines.push('  </wallets>');
  xmlLines.push(`  <transactions count="${transactions.length}">`);

  transactions.forEach((tx) => {
    const sourceWalletName = walletMap.get(tx.walletId) || tx.walletId;
    const targetWalletName = tx.targetWalletId ? (walletMap.get(tx.targetWalletId) || tx.targetWalletId) : '';

    xmlLines.push('    <transaction>');
    xmlLines.push(`      <id>${escapeXml(tx.id)}</id>`);
    xmlLines.push(`      <date>${escapeXml(tx.date)}</date>`);
    xmlLines.push(`      <month_key>${escapeXml(tx.monthKey)}</month_key>`);
    xmlLines.push(`      <type>${escapeXml(tx.type)}</type>`);
    xmlLines.push(`      <wallet>${escapeXml(sourceWalletName)}</wallet>`);
    if (tx.type === 'transfer' && targetWalletName) {
      xmlLines.push(`      <target_wallet>${escapeXml(targetWalletName)}</target_wallet>`);
    }
    xmlLines.push(`      <category>${escapeXml(tx.category)}</category>`);
    xmlLines.push(`      <description>${escapeXml(tx.description)}</description>`);
    xmlLines.push(`      <amount>${tx.amount.toFixed(2)}</amount>`);
    xmlLines.push('    </transaction>');
  });

  xmlLines.push('  </transactions>');
  xmlLines.push('</finance_report>');

  return xmlLines.join('\n');
}

export function downloadXmlFile(xmlContent: string, fileName: string) {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
