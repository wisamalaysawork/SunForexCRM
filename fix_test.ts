import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL }}})

async function main() {
   const pays = await db.payment.findMany()
   
   let mProfits = {}
   for(let p of pays) {
       mProfits[p.month] = (mProfits[p.month] || 0) + p.amount
   }
   console.log(mProfits)
   
   // is there ANY combination of income - expenses that equals 750?
}
main().catch(console.error).finally(()=> db.$disconnect())
