import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("يرجى إدخال اسم المستخدم وكلمة المرور");
        }

        const user = await db.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user || !user.password) {
          throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
        }

        return {
          id: user.id,
          name: user.username,
          username: user.username,
          canManageStudents: user.canManageStudents,
          canManageCourses: user.canManageCourses,
          canManageFunded: user.canManageFunded,
          canManageAccounting: user.canManageAccounting,
          canManagePartners: user.canManagePartners,
          canManageUsers: user.canManageUsers,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.permissions = {
          canManageStudents: (user as any).canManageStudents,
          canManageCourses: (user as any).canManageCourses,
          canManageFunded: (user as any).canManageFunded,
          canManageAccounting: (user as any).canManageAccounting,
          canManagePartners: (user as any).canManagePartners,
          canManageUsers: (user as any).canManageUsers,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.permissions = token.permissions;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development_only",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
