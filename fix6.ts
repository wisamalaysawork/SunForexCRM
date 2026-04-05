import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const p = await db.payment.findMany()
  console.log("Payments count:", p.length)
  if(p.length > 0) {
      console.log("First payment amount:", p[0].amount)
  }
}
main().catch(console.error).finally(()=> db.$disconnect())
