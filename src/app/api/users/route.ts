import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.permissions?.canManageUsers) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        canManageStudents: true,
        canManageCourses: true,
        canManageFunded: true,
        canManageAccounting: true,
        canManagePartners: true,
        canManageDebts: true,
        canManageUsers: true,
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "فشل استرجاع المستخدمين" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.permissions?.canManageUsers) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { username, password, ...permissions } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "اسم المستخدم وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "اسم المستخدم موجود مسبقاً" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        canManageStudents: permissions.canManageStudents ?? true,
        canManageCourses: permissions.canManageCourses ?? true,
        canManageFunded: permissions.canManageFunded ?? true,
        canManageAccounting: permissions.canManageAccounting ?? true,
        canManagePartners: permissions.canManagePartners ?? true,
        canManageDebts: permissions.canManageDebts ?? true,
        canManageUsers: permissions.canManageUsers ?? false,
      }
    });

    return NextResponse.json({ message: "تمت إضافة المستخدم بنجاح" });
  } catch (error) {
    return NextResponse.json({ error: "فشل إضافة المستخدم" }, { status: 500 });
  }
}
