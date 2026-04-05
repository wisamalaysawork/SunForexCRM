import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const baseWhere = { deletedAt: null }
  const ex = await db.expense.aggregate({ where: baseWhere, _sum: { amount: true } })
  console.log("Expenses:", ex._sum.amount)
}
main().catch(console.error).finally(()=> db.$disconnect())
