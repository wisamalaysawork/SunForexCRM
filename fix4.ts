import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function getProf(month) {
  const baseWhere = { deletedAt: null }
  
  // Dashboard All Time Logic:
  const tRev = await db.payment.aggregate({ where: { ...baseWhere, month }, _sum: { amount: true } })
  const incM = tRev._sum.amount || 0;
  
  const tExp = await db.expense.aggregate({ where: { ...baseWhere, month }, _sum: { amount: true } })
  const mExp = tExp._sum.amount || 0;
  let fCost = 0;
  let eR = 0;
  let fR = 0;
  // enroll and funded don't have month filter easily for findMany in script but they might be here
  const es = await db.courseEnrollment.findMany({ where: { ...baseWhere } })
  const fs = await db.fundedAccountSale.findMany({ where: { ...baseWhere }, include: { accountType: true } })
  for(let e of es) {
      if(e.createdAt.toISOString().slice(0, 7) === month && (e.paymentStatus==='paid' || e.paymentStatus==='partial')) eR += e.amountPaid;
  }
  for(let f of fs) {
      if(f.soldAt.toISOString().slice(0, 7) === month && (f.paymentStatus==='paid' || f.paymentStatus==='partial')) fR += f.amountPaid;
      if(f.soldAt.toISOString().slice(0, 7) === month && f.paymentStatus !== 'cancelled') fCost += (f.accountType?.costPrice || 0);
  }
  
  const inc = incM + eR + fR;
  const exp = mExp + fCost;
  return inc - exp;
}

async function main() {
    console.log("2026-03 PnL:", await getProf("2026-03"))
    console.log("2026-04 PnL:", await getProf("2026-04"))
}
main().catch(console.error).finally(()=> db.$disconnect())
