import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const baseWhere = { deletedAt: null }
  const month = "2026-03" 
  
  const p = await db.payment.aggregate({ where: { ...baseWhere, month }, _sum: { amount: true } })
  const ex = await db.expense.aggregate({ where: { ...baseWhere, month }, _sum: { amount: true } })
  
  console.log("March 2026:")
  console.log("Payments:", p._sum.amount)
  console.log("Expenses:", ex._sum.amount)
}
main().catch(console.error).finally(()=> db.$disconnect())
