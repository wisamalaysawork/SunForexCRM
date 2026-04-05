import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const baseWhere = { deletedAt: null }
  
  // Dashboard All Time Logic:
  const tRev = await db.payment.aggregate({ where: baseWhere, _sum: { amount: true } })
  const eRev = await db.courseEnrollment.aggregate({ where: { ...baseWhere, paymentStatus: { not: 'cancelled' } }, _sum: { amountPaid: true } })
  const fRev = await db.fundedAccountSale.aggregate({ where: { ...baseWhere, paymentStatus: { not: 'cancelled' } }, _sum: { amountPaid: true } })
  
  const fArray = await db.fundedAccountSale.findMany({
    where: { ...baseWhere, paymentStatus: { not: 'cancelled' } },
    select: { accountType: { select: { costPrice: true } } }
  })
  const fCost = fArray.reduce((acc, curr) => acc + (curr.accountType?.costPrice || 0), 0)
  const tExp = await db.expense.aggregate({ where: baseWhere, _sum: { amount: true } })
  
  const pInc = await db.partnerIncome.aggregate({ where: baseWhere, _sum: { amount: true } })
  const dRec = await db.debt.aggregate({ where: baseWhere, _sum: { amount: true } })
  const dRep = await db.debtPayment.aggregate({ where: baseWhere, _sum: { amount: true } })
  
  const inc = (tRev._sum.amount||0) + (eRev._sum.amountPaid||0) + (fRev._sum.amountPaid||0)
  const exp = (tExp._sum.amount||0) + fCost
  const prof = inc - exp
  
  console.log({ tRev: tRev._sum.amount, eRev: eRev._sum.amountPaid, fRev: fRev._sum.amountPaid })
  console.log({ fCost, tExp: tExp._sum.amount })
  console.log({ inc, exp, prof })
  
  const inc2 = inc + (pInc._sum.amount||0) + (dRec._sum.amount||0)
  const exp2 = exp + (dRep._sum.amount||0)
  const prof2 = inc2 - exp2
  
  console.log({ inc2, exp2, prof2 })
}
main().catch(console.error).finally(()=> db.$disconnect())
