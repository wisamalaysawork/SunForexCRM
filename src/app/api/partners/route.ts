import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.permissions?.canManagePartners) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }
  
  try {
    const partners = await db.partner.findMany({
      include: { incomes: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(partners);
  } catch (err) {
    return NextResponse.json({ error: "فشل استرجاع الشركاء" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.permissions?.canManagePartners) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }
  try {
    const { name, description } = await req.json();
    const partner = await db.partner.create({ data: { name, description } });
    return NextResponse.json(partner);
  } catch (err) {
    return NextResponse.json({ error: "فشل إضافة الشريك" }, { status: 500 });
  }
}
