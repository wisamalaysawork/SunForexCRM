import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function main() {
  const pays = await db.payment.findMany()
  const enrs = await db.courseEnrollment.findMany()
  const funs = await db.fundedAccountSale.findMany({ include: { accountType: true } })
  const exps = await db.expense.findMany()

  let pTotal = pays.reduce((sum, p) => sum + p.amount, 0)
  let eTotal = enrs.reduce((sum, e) => sum + e.amountPaid, 0)
  let fTotal = funs.reduce((sum, f) => sum + f.amountPaid, 0)
  let fCost = funs.reduce((sum, f) => sum + (f.paymentStatus !== 'cancelled' && f.accountType ? f.accountType.costPrice : 0), 0)
  let expTotal = exps.reduce((sum, e) => sum + e.amount, 0)

  console.log("Payments sum:", pTotal)
  console.log("Enrollments sum:", eTotal)
  console.log("Funded Sales sum:", fTotal)
  console.log("Funded Costs sum:", fCost)
  console.log("Expenses sum:", expTotal)

  console.log("Total Income (P + E + F):", pTotal + eTotal + fTotal)
  console.log("Total Expenses (Exp + FCost):", expTotal + fCost)
  console.log("Net Profit:", (pTotal + eTotal + fTotal) - (expTotal + fCost))

  console.log("\nDetails of Payments:", pays.map(p => ({ amt: p.amount, desc: p.description })))
  
}
main().catch(console.error).finally(()=> db.$disconnect())
