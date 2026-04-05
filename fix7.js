const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function main() {
  const baseWhere = { deletedAt: null }
  
  const allEnr = await db.courseEnrollment.findMany({ where: baseWhere })
  console.log("Found Enrollments", allEnr.length)
  
  const allFun = await db.fundedAccountSale.findMany({ where: baseWhere, include: { accountType: true } })
  console.log("Found Funded", allFun.length)

  const allPay = await db.payment.findMany({ where: baseWhere })
  console.log("Found Payments", allPay.length)
  
  const ex = await db.expense.findMany({ where: baseWhere })
  console.log("Found Expenses", ex.length)

  let prof = 0;
  for(let x of allPay) prof += x.amount
  for(let x of allEnr) if(x.paymentStatus!=='cancelled') prof += x.amountPaid
  for(let x of allFun) if(x.paymentStatus!=='cancelled') prof += x.amountPaid
  for(let x of allFun) if(x.paymentStatus!=='cancelled') prof -= (x.accountType?.costPrice || 0)
  for(let x of ex) prof -= x.amount
   
  console.log("Total DB net profit:", prof)
  
  let pM = {}
  for(let p of allPay) {
     let m = p.month || p.date.toISOString().slice(0, 7)
     pM[m] = (pM[m]||0) + p.amount
  }
  let eM = {}
  for(let e of allEnr) {
     let m = e.createdAt.toISOString().slice(0, 7)
     if(e.paymentStatus!=='cancelled') eM[m] = (eM[m]||0) + e.amountPaid
  }
  let fM = {}
  let fC = {}
  for(let f of allFun) {
     let m = f.soldAt.toISOString().slice(0, 7)
     if(f.paymentStatus!=='cancelled') fM[m] = (fM[m]||0) + f.amountPaid
     if(f.paymentStatus!=='cancelled') fC[m] = (fC[m]||0) + (f.accountType?.costPrice || 0)
  }
  let exM = {}
  for(let p of ex) {
     let m = p.month || "no-month"
     exM[m] = (exM[m]||0) + p.amount
  }
  console.log("Pay", pM)
  console.log("Enr", eM)
  console.log("Fun", fM)
  console.log("FCost", fC)
  console.log("Exp", exM)
}
main().catch(console.error).finally(()=> db.$disconnect())
