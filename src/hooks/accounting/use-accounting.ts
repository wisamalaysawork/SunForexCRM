import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAccountingData(month: string) {
  return useQuery({
    queryKey: ['accounting', month],
    queryFn: async () => {
      const [expRes, payRes, enrollRes, fundedRes, partnerIncomeRes, debtPayRes, debtRes] = await Promise.all([
        fetch(`/api/expenses?month=${month}`),
        fetch(`/api/payments?month=${month}`),
        fetch(`/api/enrollments`),
        fetch(`/api/funded-sales`),
        fetch(`/api/partner-incomes?month=${month}`),
        fetch(`/api/debts/payments?month=${month}`),
        fetch(`/api/debts`)
      ]);

      if (!expRes.ok || !payRes.ok || !enrollRes.ok || !fundedRes.ok || !partnerIncomeRes.ok || !debtPayRes.ok || !debtRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [expenses, payments, allEnrollments, allFundedSales, partnerIncomes, debtPayments, allDebts] = await Promise.all([
        expRes.json(),
        payRes.json(),
        enrollRes.json(),
        fundedRes.json(),
        partnerIncomeRes.json(),
        debtPayRes.json(),
        debtRes.json()
      ]);

      // Filter enrollments/funded/debts by month clientside for now as api doesn't support month filtering on get yet
      const monthEnrollments = allEnrollments.filter((e: any) => {
        if (!e.createdAt) return false;
        const d = new Date(e.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === month;
      });

      const monthFundedSales = allFundedSales.filter((s: any) => {
        if (!s.soldAt) return false;
        const d = new Date(s.soldAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === month;
      });

      const monthDebts = allDebts.filter((d: any) => {
        if (!d.startDate) return false;
        const dt = new Date(d.startDate);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}` === month;
      });

      return { expenses, payments, monthEnrollments, monthFundedSales, partnerIncomes, debtPayments, monthDebts };
    }
  });
}

export function useExpenseMutations(month: string) {
  const queryClient = useQueryClient();

  const createExpense = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', month] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('تم إضافة المصروف بنجاح');
    },
    onError: (err: any) => toast.error(err.message || 'حدث خطأ أثناء الحفظ'),
  });

  const updateExpense = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', month] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('تم تحديث المصروف بنجاح');
    },
    onError: (err: any) => toast.error(err.message || 'حدث خطأ أثناء التحديث'),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', month] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('تم حذف المصروف بنجاح');
    },
    onError: (err: any) => toast.error(err.message || 'حدث خطأ أثناء الحذف'),
  });

  return { createExpense, updateExpense, deleteExpense };
}
