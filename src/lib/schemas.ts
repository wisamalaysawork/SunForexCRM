import { z } from 'zod';

export const StudentSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional(),
});

export const CourseSchema = z.object({
  name: z.string().min(2, "اسم الدورة مطلوب"),
  description: z.string().optional(),
  price: z.number().nonnegative("السعر يجب أن يكون 0 أو أكثر"),
  isActive: z.boolean().default(true),
});

export const CourseEnrollmentSchema = z.object({
  studentId: z.string().cuid(),
  courseId: z.string().cuid(),
  paymentStatus: z.enum(['pending', 'paid', 'partial', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

export const FundedAccountTypeSchema = z.object({
  name: z.string().min(2, "اسم الحساب مطلوب"),
  accountSize: z.number().positive("حجم الحساب يجب أن يكون أكبر من 0"),
  sellingPrice: z.number().nonnegative(),
  costPrice: z.number().nonnegative(),
  isActive: z.boolean().default(true),
});

export const FundedAccountSaleSchema = z.object({
  studentId: z.string().cuid(),
  accountTypeId: z.string().cuid(),
  paymentStatus: z.enum(['pending', 'paid', 'partial', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

export const ExpenseSchema = z.object({
  category: z.string().min(1, "التصنيف مطلوب"), // could be enum
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من 0"),
  description: z.string().optional(),
  date: z.string().min(1, "التاريخ مطلوب"),
  isPaid: z.boolean().default(true).optional(),
});

export const PaymentSchema = z.object({
  studentId: z.string().cuid(),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من 0").multipleOf(0.01, "تجاوز الحد الأقصى للكسور العشرية"),
  method: z.enum(['cash', 'bank_transfer', 'crypto', 'other']).default('cash'),
  description: z.string().optional(),
  date: z.string().optional(),
});
