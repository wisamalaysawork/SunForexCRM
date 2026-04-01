import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.permissions?.canManageUsers) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { username, password, ...permissions } = body;

    let updateData: any = {
      username,
      canManageStudents: permissions.canManageStudents,
      canManageCourses: permissions.canManageCourses,
      canManageFunded: permissions.canManageFunded,
      canManageAccounting: permissions.canManageAccounting,
      canManageUsers: permissions.canManageUsers,
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ message: "تم تحديث المستخدم بنجاح" });
  } catch (error) {
    return NextResponse.json({ error: "فشل تحديث المستخدم" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.permissions?.canManageUsers) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
  }

  // Prevent users from deleting themselves
  if (session.user.id === params.id) {
    return NextResponse.json({ error: "لا يمكنك حذف حسابك الحالي" }, { status: 400 });
  }

  try {
    await db.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "تم الحذف بنجاح" });
  } catch (error) {
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}
