const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env' })
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function main() {
   const pays = await db.payment.findMany()
   const enrs = await db.courseEnrollment.findMany()
   const funs = await db.fundedAccountSale.findMany({ include: { accountType: true } })
   const exps = await db.expense.findMany()
   
   let pTotal = pays.reduce((sum, p) => sum + p.amount, 0)
   let eTotal = enrs.filter(e => e.paymentStatus !== 'cancelled').reduce((sum, e) => sum + e.amountPaid, 0)
   let fTotal = funs.filter(e => e.paymentStatus !== 'cancelled').reduce((sum, f) => sum + f.amountPaid, 0)
   let fCost = funs.filter(e => e.paymentStatus !== 'cancelled').reduce((sum, f) => sum + (f.accountType ? f.accountType.costPrice : 0), 0)
   let expTotal = exps.reduce((sum, e) => sum + e.amount, 0)

   console.log("Payments sum:", pTotal)
   console.log("Enrollments sum:", eTotal)
   console.log("Funded Sales sum:", fTotal)
   console.log("Funded Costs sum:", fCost)
   console.log("Expenses sum:", expTotal)
   console.log("Net profit:", (pTotal + eTotal + fTotal) - (expTotal + fCost))
}
main().catch(console.error).finally(()=> db.$disconnect())
