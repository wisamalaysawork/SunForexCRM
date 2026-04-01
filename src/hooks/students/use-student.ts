import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useStudentDetails(studentId: string | null) {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) return null
      const res = await fetch(`/api/student/${studentId}`)
      if (!res.ok) throw new Error('فشل در جلب بيانات الطالب')
      return res.json()
    },
    enabled: !!studentId,
  })
}

export function useStudentEnrollments(studentId: string | null) {
  return useQuery({
    queryKey: ['enrollments', studentId],
    queryFn: async () => {
      if (!studentId) return []
      const res = await fetch(`/api/enrollments?studentId=${studentId}`)
      if (!res.ok) throw new Error('فشل في جلب التسجيلات')
      return res.json()
    },
    enabled: !!studentId,
    initialData: [],
  })
}

export function useStudentFundedSales(studentId: string | null) {
  return useQuery({
    queryKey: ['fundedSales', studentId],
    queryFn: async () => {
      if (!studentId) return []
      const res = await fetch(`/api/funded-sales?studentId=${studentId}`)
      if (!res.ok) throw new Error('فشل في جلب المبيعات الممولة')
      return res.json()
    },
    enabled: !!studentId,
    initialData: [],
  })
}

export function useStudentPayments(studentId: string | null) {
  return useQuery({
    queryKey: ['payments', studentId],
    queryFn: async () => {
      if (!studentId) return []
      const res = await fetch(`/api/payments?studentId=${studentId}`)
      if (!res.ok) throw new Error('فشل في جلب المدفوعات')
      return res.json()
    },
    enabled: !!studentId,
    initialData: [],
  })
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error('فشل في جلب الدورات')
      return res.json()
    },
    initialData: [],
  })
}

export function useAccountTypes() {
  return useQuery({
    queryKey: ['accountTypes'],
    queryFn: async () => {
      const res = await fetch('/api/funded-accounts')
      if (!res.ok) throw new Error('فشل في جلب أنواع الحسابات')
      return res.json()
    },
    initialData: [],
  })
}

// Global mutations for related entities
export function useStudentEntityMutations(studentId: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['student', studentId] })
    queryClient.invalidateQueries({ queryKey: ['students'] })
    queryClient.invalidateQueries({ queryKey: ['enrollments', studentId] })
    queryClient.invalidateQueries({ queryKey: ['fundedSales', studentId] })
    queryClient.invalidateQueries({ queryKey: ['payments', studentId] })
    queryClient.invalidateQueries({ queryKey: ['accounting'] })
  }

  // --- Enrollments ---
  const addEnrollment = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, studentId })
      })
      if (!res.ok) throw new Error('فشل در إضافة التسجيل')
      return res.json()
    },
    onSuccess: () => {
      toast.success('تم التسجيل في الدورة بنجاح')
      invalidate()
    },
    onError: (error: any) => toast.error(error.message)
  })

  // --- Funded Accounts ---
  const addFundedAccount = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/funded-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, studentId })
      })
      if (!res.ok) throw new Error('فشل در إضافة الحساب الممول')
      return res.json()
    },
    onSuccess: () => {
      toast.success('تمت إضافة الحساب الممول بنجاح')
      invalidate()
    },
    onError: (error: any) => toast.error(error.message)
  })

  // --- Payments ---
  const addPayment = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, studentId })
      })
      if (!res.ok) throw new Error('فشل در إضافة الدفعة')
      return res.json()
    },
    onSuccess: () => {
      toast.success('تم تسجيل الدفعة بنجاح')
      invalidate()
    },
    onError: (error: any) => toast.error(error.message)
  })

  // Generic Update Payment Status (for Enrollments / Funded)
  const updatePaymentStatus = useMutation({
    mutationFn: async ({ endpoint, id, data }: { endpoint: string, id: string, data: any }) => {
      const res = await fetch(`/api/${endpoint}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('فشل در تحديث حالة الدفع')
      return res.json()
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة الدفع بنجاح')
      invalidate()
    },
    onError: (error: any) => toast.error(error.message)
  })

  const deleteEntity = useMutation({
    mutationFn: async ({ endpoint, id }: { endpoint: string, id: string }) => {
      const res = await fetch(`/api/${endpoint}?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل در الحذف')
      return res.json()
    },
    onSuccess: () => {
      toast.success('تم الحذف بنجاح')
      invalidate()
    },
    onError: (error: any) => toast.error(error.message)
  })

  return { addEnrollment, addFundedAccount, addPayment, updatePaymentStatus, deleteEntity }
}
