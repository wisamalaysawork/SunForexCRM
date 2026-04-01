import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type StudentFilters = {
  search?: string
  status?: string
}

export function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status) params.append('status', filters.status)
        
      const res = await fetch(`/api/students?${params.toString()}`)
      if (!res.ok) throw new Error('فشل در جلب بيانات الطلاب')
      return res.json()
    }
  })
}

export function useStudentMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['students'] })
  }

  const createStudent = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('فشل در إضافة الطالب')
      return res.json()
    },
    onSuccess: () => {
      toast.success('تمت إضافة الطالب بنجاح')
      invalidate()
    },
    onError: (error: any) => toast.error(error.message)
  })

  const updateStudent = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('فشل در تحديث الطالب')
      return res.json()
    },
    onSuccess: () => {
      toast.success('تم التحديث بنجاح')
      invalidate()
    },
    onError: (error: any) => toast.error(error.message)
  })

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل در حذف الطالب')
      return res.json()
    },
    onSuccess: () => {
      toast.success('تم الحذف بنجاح')
      invalidate()
    },
    onError: (error: any) => toast.error(error.message)
  })

  return { createStudent, updateStudent, deleteStudent }
}