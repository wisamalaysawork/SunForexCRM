
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('========== FULL DATABASE AUDIT ==========\n');

  // Count ALL records (including soft-deleted)
  const allPayments = await prisma.payment.findMany();
  const allEnrollments = await prisma.courseEnrollment.findMany({ include: { course: true, student: true } });
  const allFundedSales = await prisma.fundedAccountSale.findMany({ include: { accountType: true, student: true } });
  const allExpenses = await prisma.expense.findMany();
  const allDebts = await prisma.debt.findMany();
  const allDebtPayments = await prisma.debtPayment.findMany();
  const allPartnerIncomes = await prisma.partnerIncome.findMany({ include: { partner: true } });
  const allAccountTypes = await prisma.fundedAccountType.findMany();

  console.log('--- Record Counts (ALL, including soft-deleted) ---');
  console.log(`Payments:        ${allPayments.length}`);
  console.log(`Enrollments:     ${allEnrollments.length}`);
  console.log(`Funded Sales:    ${allFundedSales.length}`);
  console.log(`Expenses:        ${allExpenses.length}`);
  console.log(`Debts:           ${allDebts.length}`);
  console.log(`Debt Payments:   ${allDebtPayments.length}`);
  console.log(`Partner Incomes: ${allPartnerIncomes.length}`);
  console.log(`Account Types:   ${allAccountTypes.length}`);

  // Count non-deleted
  const activePayments = allPayments.filter(p => !p.deletedAt);
  const activeEnrollments = allEnrollments.filter(e => !e.deletedAt);
  const activeFundedSales = allFundedSales.filter(s => !s.deletedAt);
  const activeExpenses = allExpenses.filter(e => !e.deletedAt);
  const activeDebts = allDebts.filter(d => !d.deletedAt);
  const activeDebtPayments = allDebtPayments.filter(p => !p.deletedAt);
  const activePartnerIncomes = allPartnerIncomes.filter(i => !i.deletedAt);

  console.log('\n--- Record Counts (Active Only, deletedAt = null) ---');
  console.log(`Payments:        ${activePayments.length}  (Total: $${activePayments.reduce((s, p) => s + p.amount, 0)})`);
  console.log(`Enrollments:     ${activeEnrollments.length}  (Total AmountPaid: $${activeEnrollments.reduce((s, e) => s + e.amountPaid, 0)})`);
  console.log(`Funded Sales:    ${activeFundedSales.length}  (Total AmountPaid: $${activeFundedSales.reduce((s, f) => s + f.amountPaid, 0)})`);
  console.log(`Expenses:        ${activeExpenses.length}  (Total: $${activeExpenses.reduce((s, e) => s + e.amount, 0)})`);
  console.log(`Debts:           ${activeDebts.length}  (Total: $${activeDebts.reduce((s, d) => s + d.amount, 0)})`);
  console.log(`Debt Payments:   ${activeDebtPayments.length}  (Total: $${activeDebtPayments.reduce((s, p) => s + p.amount, 0)})`);
  console.log(`Partner Incomes: ${activePartnerIncomes.length}  (Total: $${activePartnerIncomes.reduce((s, i) => s + i.amount, 0)})`);

  // ========== Replicate Dashboard Calculation (ALL-TIME, no month filter) ==========
  console.log('\n========== DASHBOARD PROFIT CALCULATION (ALL-TIME) ==========\n');

  const paymentsTotal = activePayments.reduce((s, p) => s + p.amount, 0);
  
  const enrollmentTotal = activeEnrollments
    .filter(e => e.paymentStatus === 'paid' || e.paymentStatus === 'partial')
    .reduce((s, e) => s + e.amountPaid, 0);

  const fundedSalesTotal = activeFundedSales
    .filter(s => s.paymentStatus === 'paid' || s.paymentStatus === 'partial')
    .reduce((s, s2) => s + s2.amountPaid, 0);

  const partnerTotal = activePartnerIncomes.reduce((s, i) => s + i.amount, 0);
  const debtReceivedTotal = activeDebts.reduce((s, d) => s + d.amount, 0);

  const totalIncome = paymentsTotal + enrollmentTotal + fundedSalesTotal + partnerTotal + debtReceivedTotal;

  console.log('INCOME:');
  console.log(`  Payments (direct):     $${paymentsTotal}`);
  console.log(`  Enrollment income:     $${enrollmentTotal}`);
  console.log(`  Funded Sales income:   $${fundedSalesTotal}`);
  console.log(`  Partner income:        $${partnerTotal}`);
  console.log(`  Debt received:         $${debtReceivedTotal}`);
  console.log(`  ---`);
  console.log(`  TOTAL INCOME:          $${totalIncome}`);

  const expenseTotal = activeExpenses.reduce((s, e) => s + e.amount, 0);
  
  const fundedCosts = activeFundedSales
    .filter(s => s.paymentStatus !== 'cancelled')
    .reduce((sum, sale) => sum + (sale.accountType?.costPrice || 0), 0);
  
  const debtRepaymentsTotal = activeDebtPayments.reduce((s, p) => s + p.amount, 0);

  const totalExpenses = expenseTotal + fundedCosts + debtRepaymentsTotal;

  console.log('\nEXPENSES:');
  console.log(`  Manual expenses:       $${expenseTotal}`);
  console.log(`  Funded account costs:  $${fundedCosts}`);
  console.log(`  Debt repayments:       $${debtRepaymentsTotal}`);
  console.log(`  ---`);
  console.log(`  TOTAL EXPENSES:        $${totalExpenses}`);

  const profit = totalIncome - totalExpenses;
  console.log(`\n🏦 NET PROFIT:           $${profit}`);

  // ========== Check for double-counting ==========
  console.log('\n========== DOUBLE-COUNTING ANALYSIS ==========\n');
  
  // Check if payments overlap with enrollment amounts
  let overlaps = 0;
  for (const p of activePayments) {
    if (!p.studentId) continue;
    
    for (const e of activeEnrollments) {
      if (e.studentId === p.studentId && 
          Math.abs(e.amountPaid - p.amount) < 0.01 &&
          Math.abs(new Date(e.createdAt).getTime() - new Date(p.date).getTime()) < 1000 * 60 * 60 * 24) {
        overlaps++;
        console.log(`⚠️  OVERLAP Payment/Enrollment: Student=${p.studentId}, Amount=$${p.amount}, PayDate=${p.date.toISOString().slice(0,10)}, EnrollDate=${e.createdAt.toISOString().slice(0,10)}`);
      }
    }

    for (const s of activeFundedSales) {
      if (s.studentId === p.studentId && 
          Math.abs(s.amountPaid - p.amount) < 0.01 &&
          Math.abs(new Date(s.createdAt).getTime() - new Date(p.date).getTime()) < 1000 * 60 * 60 * 24) {
        overlaps++;
        console.log(`⚠️  OVERLAP Payment/FundedSale: Student=${p.studentId}, Amount=$${p.amount}, PayDate=${p.date.toISOString().slice(0,10)}, SaleDate=${s.createdAt.toISOString().slice(0,10)}`);
      }
    }
  }
  
  if (overlaps === 0) {
    console.log('✅ No double-counting overlaps detected\n');
  }

  // ========== Show sample Payment records ==========
  console.log('\n--- Sample Payments (first 10) ---');
  activePayments.slice(0, 10).forEach(p => {
    console.log(`  id=${p.id.slice(0,8)}, student=${p.studentId?.slice(0,8) || 'N/A'}, amount=$${p.amount}, month=${p.month}, method=${p.method}, desc="${p.description || '-'}"`);
  });

  // ========== Show Account Types ==========
  console.log('\n--- Account Types ---');
  allAccountTypes.forEach(at => {
    console.log(`  ${at.name}: sell=$${at.sellingPrice}, cost=$${at.costPrice}, profit=$${at.sellingPrice - at.costPrice}, active=${at.isActive}, deleted=${at.deletedAt ? 'YES' : 'no'}`);
  });

  // ========== Show sample Enrollments ==========
  if (allEnrollments.length > 0) {
    console.log('\n--- Sample Enrollments (first 10) ---');
    allEnrollments.slice(0, 10).forEach(e => {
      console.log(`  id=${e.id.slice(0,8)}, student=${e.student?.name || 'N/A'}, course=${e.course?.name || 'N/A'}, amountPaid=$${e.amountPaid}, status=${e.paymentStatus}, deleted=${e.deletedAt ? 'YES' : 'no'}`);
    });
  }

  // ========== Show sample Funded Sales ==========
  if (allFundedSales.length > 0) {
    console.log('\n--- Sample Funded Sales (first 10) ---');
    allFundedSales.slice(0, 10).forEach(s => {
      console.log(`  id=${s.id.slice(0,8)}, student=${s.student?.name || 'N/A'}, type=${s.accountType?.name || 'N/A'}, amountPaid=$${s.amountPaid}, status=${s.paymentStatus}, deleted=${s.deletedAt ? 'YES' : 'no'}`);
    });
  }

  // ========== Show all Expenses ==========
  if (allExpenses.length > 0) {
    console.log('\n--- All Expenses ---');
    allExpenses.forEach(e => {
      console.log(`  id=${e.id.slice(0,8)}, cat=${e.category}, amount=$${e.amount}, month=${e.month}, desc="${e.description || '-'}", deleted=${e.deletedAt ? 'YES' : 'no'}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
