import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function main() {
  const baseWhere = { deletedAt: null }
  
  // What is the net profit according to dashboard inside EACH month?
  const allEnr = await db.courseEnrollment.findMany({ where: baseWhere, include: { payment: true } })
  console.log("Found Enrollments", allEnr.length)
  
  const allFun = await db.fundedAccountSale.findMany({ where: baseWhere, include: { accountType: true } })
  console.log("Found Funded", allFun.length)

  const allPay = await db.payment.findMany({ where: baseWhere })
  console.log("Found Payments", allPay.length)

  const pM = { "2026-01": 0, "2026-02":0, "2026-03": 0, "2026-04":0, "null": 0 }
  for(let x of allPay) {
      if(pM[x.month]) pM[x.month] += x.amount
      else if(x.month===null) pM["null"] += x.amount
      else pM[x.month] = x.amount
  }
  console.log("Payments by month:", pM)

  // Let's see what accounting.tsx for all-time would be:
  // accounting.tsx groups enrollments by their createdAt month, funded by soldAt
}
main().catch(console.error).finally(()=> db.$disconnect())
