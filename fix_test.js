const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function main() {
   const pays = await db.payment.findMany()
   
   let mProfits = {}
   for(let p of pays) {
       let m = p.month || p.date.toISOString().slice(0, 7)
       mProfits[m] = (mProfits[m] || 0) + p.amount
   }
   console.log(mProfits)
   
   // Check again. 
   const expenses = await db.expense.findMany()
   console.log("expenses:", expenses)
}
main().catch(console.error).finally(()=> db.$disconnect())
