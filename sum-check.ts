import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function main() {
   const pays = await db.payment.aggregate({ _sum: { amount: true } })
   const enrs = await db.courseEnrollment.aggregate({ where: { paymentStatus: { in: ['paid', 'partial'] } }, _sum: { amountPaid: true } })
   const funs = await db.fundedAccountSale.aggregate({ where: { paymentStatus: { in: ['paid', 'partial'] } }, _sum: { amountPaid: true } })

   console.log("Payments all time sum:", pays._sum.amount)
   console.log("Enrollments all time sum:", enrs._sum.amountPaid)
   console.log("Funded Sales all time sum:", funs._sum.amountPaid)
   
   const pM = await db.payment.aggregate({ where: { month: "2026-04" }, _sum: { amount: true } })
   console.log("Payments this month sum:", pM._sum.amount)
}
main().catch(console.error).finally(()=> db.$disconnect())
