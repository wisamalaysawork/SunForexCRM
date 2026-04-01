import DebtsManager from "@/components/debts/debts-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إدارة الديون | SunForex CRM",
  description: "تتبع القروض والديون والمدفوعات",
};

export default function DebtsPage() {
  return <DebtsManager />;
}
