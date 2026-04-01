import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }
  
  // Allow if user is either managing partners, OR checking accounting details
  const perms = session.user?.permissions;
  if (!perms?.canManagePartners && !perms?.canManageAccounting) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }

  try {
    const where = month ? { month } : {};
    const incomes = await db.partnerIncome.findMany({
      where,
      include: { partner: true },
      orderBy: { date: "desc" }
    });
    return NextResponse.json(incomes);
  } catch (err) {
    return NextResponse.json({ error: "فشل استرجاع العمولات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.permissions?.canManagePartners) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }
  
  try {
    const { partnerId, amount, description, date, month } = await req.json();
    const income = await db.partnerIncome.create({ 
      data: { 
        partnerId, 
        amount: Number(amount), 
        description, 
        date: new Date(date), 
        month 
      } 
    });
    return NextResponse.json(income);
  } catch (err) {
    return NextResponse.json({ error: "فشل إضافة العمولة" }, { status: 500 });
  }
}
