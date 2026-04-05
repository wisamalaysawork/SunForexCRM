import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const baseWhere = { deletedAt: null }
  const payments = await db.payment.findMany({ where: baseWhere })
  console.log(payments)
}
main().catch(console.error).finally(() => db.$disconnect())
