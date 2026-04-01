import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const existingAdmin = await db.user.findUnique({
      where: { username: "admin" }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const newAdmin = await db.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        canManageStudents: true,
        canManageCourses: true,
        canManageFunded: true,
        canManageAccounting: true,
        canManagePartners: true,
        canManageUsers: true,
      }
    });

    return NextResponse.json({ 
      message: "Admin user created successfully", 
      username: newAdmin.username 
    });
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json({ 
      error: "Failed to create admin user", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
