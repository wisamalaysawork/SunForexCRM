import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      permissions: {
        canManageStudents: boolean;
        canManageCourses: boolean;
        canManageFunded: boolean;
        canManageAccounting: boolean;
        canManagePartners: boolean;
        canManageDebts: boolean;
        canManageUsers: boolean; // super admin role
      };
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    username: string;
    canManageStudents: boolean;
    canManageCourses: boolean;
    canManageFunded: boolean;
    canManageAccounting: boolean;
    canManagePartners: boolean;
    canManageDebts: boolean;
    canManageUsers: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    permissions: {
      canManageStudents: boolean;
      canManageCourses: boolean;
      canManageFunded: boolean;
      canManageAccounting: boolean;
      canManagePartners: boolean;
      canManageDebts: boolean;
      canManageUsers: boolean;
    };
  }
}
