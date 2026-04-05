
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const month = "2026-03"; // or whatever current month is
  
  // Get all payments
  const payments = await prisma.payment.findMany({ where: { deletedAt: null } });
  const enrollments = await prisma.courseEnrollment.findMany({ where: { deletedAt: null } });
  const fundedSales = await prisma.fundedAccountSale.findMany({ where: { deletedAt: null } });
  const debts = await prisma.debt.findMany({ where: { deletedAt: null } });
  const partnerIncomes = await prisma.partnerIncome.findMany({ where: { deletedAt: null } });
  const expenses = await prisma.expense.findMany({ where: { deletedAt: null } });
  const debtRepayments = await prisma.debtPayment.findMany({ where: { deletedAt: null } });

  console.log('--- Financial Data Summary ---');
  console.log(`Payments: ${payments.length} (Total: ${payments.reduce((s, p) => s + p.amount, 0)})`);
  console.log(`Enrollments: ${enrollments.length} (Total AmountPaid: ${enrollments.reduce((s, e) => s + e.amountPaid, 0)})`);
  console.log(`Funded Sales: ${fundedSales.length} (Total AmountPaid: ${fundedSales.reduce((s, f) => s + f.amountPaid, 0)})`);
  console.log(`Debts Received: ${debts.length} (Total: ${debts.reduce((s, d) => s + d.amount, 0)})`);
  console.log(`Partner Incomes: ${partnerIncomes.length} (Total: ${partnerIncomes.reduce((s, i) => s + i.amount, 0)})`);
  console.log(`Expenses: ${expenses.length} (Total: ${expenses.reduce((s, e) => s + e.amount, 0)})`);
  console.log(`Debt Repayments: ${debtRepayments.length} (Total: ${debtRepayments.reduce((s, r) => s + r.amount, 0)})`);

  // Check for overlap
  console.log('\n--- Checking for Overlap (Double Counting) ---');
  for (const p of payments) {
    if (!p.studentId) continue;
    
    const overlappingEnrollment = enrollments.find(e => 
      e.studentId === p.studentId && 
      Math.abs(e.amountPaid - p.amount) < 1 &&
      Math.abs(new Date(e.createdAt).getTime() - new Date(p.createdAt).getTime()) < 1000 * 60 * 60 // within 1 hour
    );
    
    if (overlappingEnrollment) {
      console.log(`Found Overlapping Payment/Enrollment: Student ${p.studentId}, Amount ${p.amount}, Date ${p.createdAt}`);
    }

    const overlappingSale = fundedSales.find(s => 
      s.studentId === p.studentId && 
      Math.abs(s.amountPaid - p.amount) < 1 &&
      Math.abs(new Date(s.createdAt).getTime() - new Date(p.createdAt).getTime()) < 1000 * 60 * 60
    );
    
    if (overlappingSale) {
      console.log(`Found Overlapping Payment/FundedSale: Student ${p.studentId}, Amount ${p.amount}, Date ${p.createdAt}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
