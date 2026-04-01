import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDebts() {
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading, error } = useQuery({
    queryKey: ['debts'],
    queryFn: () => fetch('/api/debts').then((res) => res.json()),
  });

  const createDebtMutation = useMutation({
    mutationFn: (debtData: any) =>
      fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debtData),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['debts'] }),
  });

  const updateDebtMutation = useMutation({
    mutationFn: ({ id, ...debtData }: any) =>
      fetch(`/api/debts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debtData),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['debts'] }),
  });

  const deleteDebtMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/debts/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['debts'] }),
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({ debtId, ...paymentData }: any) =>
      fetch(`/api/debts/${debtId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['debts'] }),
  });

  return {
    debts,
    isLoading,
    isError: !!error,
    createDebt: createDebtMutation.mutateAsync,
    updateDebt: updateDebtMutation.mutateAsync,
    deleteDebt: deleteDebtMutation.mutateAsync,
    addPayment: addPaymentMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['debts'] }),
  };
}
