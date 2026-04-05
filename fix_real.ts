import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function main() {
  const baseWhere = { deletedAt: null }
  
  const tRev = await db.payment.aggregate({ where: baseWhere, _sum: { amount: true } })
  const eRev = await db.courseEnrollment.aggregate({ where: { ...baseWhere, paymentStatus: { in: ['paid', 'partial'] } }, _sum: { amountPaid: true } })
  const fRev = await db.fundedAccountSale.aggregate({ where: { ...baseWhere, paymentStatus: { in: ['paid', 'partial'] } }, _sum: { amountPaid: true } })
  const eRevAll = await db.courseEnrollment.aggregate({ where: { ...baseWhere, paymentStatus: { not: 'cancelled' } }, _sum: { amountPaid: true } })
  const fRevAll = await db.fundedAccountSale.aggregate({ where: { ...baseWhere, paymentStatus: { not: 'cancelled' } }, _sum: { amountPaid: true } })
  
  const fArray = await db.fundedAccountSale.findMany({
    where: { ...baseWhere, paymentStatus: { not: 'cancelled' } },
    select: { accountType: { select: { costPrice: true } } }
  })
  const fCost = fArray.reduce((acc, curr) => acc + (curr.accountType?.costPrice || 0), 0)
  const tExp = await db.expense.aggregate({ where: baseWhere, _sum: { amount: true } })
  
  const incAll = (tRev._sum.amount||0) + (eRevAll._sum.amountPaid||0) + (fRevAll._sum.amountPaid||0)
  const expAll = (tExp._sum.amount||0) + fCost
  const profAll = incAll - expAll
  
  const incAcct = (tRev._sum.amount||0) + (eRev._sum.amountPaid||0) + (fRev._sum.amountPaid||0)
  const expAcct = (tExp._sum.amount||0) + fCost
  const profAcct = incAcct - expAcct
  
  console.log("Current DB Dashboard Logic Total Profit (All time):", profAll)
  console.log("Accounting Total Profit (All time):", profAcct)
  
  // also check if "month" makes it different:
  const month = "2026-04"
  const mRev = await db.payment.aggregate({ where: { ...baseWhere, month }, _sum: { amount: true } })
  const incM = mRev._sum.amount || 0;
  console.log("Payments inside month:", incM);
}
main().catch(console.error).finally(()=> db.$disconnect())
