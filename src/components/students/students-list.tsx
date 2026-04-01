'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigation } from '@/components/shared/navigation-context'
import { useStudents, useStudentMutations } from '@/hooks/students/use-students'
import { Plus, Search, Edit, Trash2, Eye, Users, UserCheck, UserX, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface Student {
  id: string
  name: string
  phone: string | null
  email: string | null
  status: string
  notes: string | null
  address: string | null
  totalPaid: number
  createdAt: string
  courseEnrollments: any[]
  fundedAccountSales: any[]
  _count: { payments: number }
}

export function StudentsList() {
  const { setCurrentPage, setSelectedStudentId } = useNavigation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', status: 'active', notes: '', address: '' })

  const { data: students = [], isLoading } = useStudents({
    search,
    status: statusFilter !== 'all' ? statusFilter : undefined
  })

  const { createStudent, updateStudent, deleteStudent } = useStudentMutations()

  const openCreate = () => {
    setEditStudent(null)
    setForm({ name: '', phone: '', email: '', status: 'active', notes: '', address: '' })
    setDialogOpen(true)
  }

  const openEdit = (s: Student) => {
    setEditStudent(s)
    setForm({ 
      name: s.name, 
      phone: s.phone || '', 
      email: s.email || '', 
      status: s.status, 
      notes: s.notes || '',
      address: s.address || ''
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('الاسم مطلوب')
      return
    }

    if (editStudent) {
      updateStudent.mutate({ id: editStudent.id, ...form }, {
        onSuccess: () => setDialogOpen(false)
      })
    } else {
      createStudent.mutate(form, {
        onSuccess: () => setDialogOpen(false)
      })
    }
  }

  const handleDelete = async () => {
    if (!studentToDelete) return
    try {
      await deleteStudent.mutateAsync(studentToDelete.id)
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
    } catch (e) {
      console.error(e)
    }
  }

  const viewDetail = (id: string) => {
    setSelectedStudentId(id)
    setCurrentPage('student-detail')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة الطلاب</h2>
          <p className="text-muted-foreground">إجمالي {students.length} طالب</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus size={18} /> إضافة طالب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</DialogTitle>
              <DialogDescription>
                {editStudent ? 'قم بتعديل بيانات الطالب الحالية هنا.' : 'أدخل بيانات الطالب الجديد الأساسية.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">الاسم *</Label>
                <Input 
                  id="student-name"
                  name="name"
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="اسم الطالب" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="student-phone">الهاتف</Label>
                  <Input 
                    id="student-phone"
                    name="phone"
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                    placeholder="رقم الهاتف" 
                    dir="ltr" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-email">الإيميل</Label>
                  <Input 
                    id="student-email"
                    name="email"
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    placeholder="البريد الإلكتروني" 
                    dir="ltr" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-status">الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger id="student-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="inactive">غير فعال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-address">العنوان</Label>
                <Input 
                  id="student-address"
                  name="address"
                  value={form.address} 
                  onChange={e => setForm({ ...form, address: e.target.value })} 
                  placeholder="مثلاً: رام الله، شارع الإرسال" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-notes">ملاحظات</Label>
                <Textarea 
                  id="student-notes"
                  name="notes"
                  value={form.notes} 
                  onChange={e => setForm({ ...form, notes: e.target.value })} 
                  placeholder="ملاحظات إضافية..." 
                />
              </div>
              <Button onClick={handleSave} disabled={createStudent.isPending || updateStudent.isPending} className="w-full">
                {editStudent ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground" size={18} />
            <div>
              <p className="text-xs text-muted-foreground">الكل</p>
              <p className="font-bold">{students.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <UserCheck className="text-green-600" size={18} />
            <div>
              <p className="text-xs text-muted-foreground">فعال</p>
              <p className="font-bold text-green-600">{students.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <UserX className="text-red-500" size={18} />
            <div>
              <p className="text-xs text-muted-foreground">غير فعال</p>
              <p className="font-bold text-red-500">{students.filter(s => s.status === 'inactive').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Mail className="text-blue-500" size={18} />
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المدفوعات</p>
              <p className="font-bold">${students.reduce((s, st) => s + st.totalPaid, 0).toFixed(0)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            id="search-students"
            name="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الهاتف، أو الإيميل..."
            className="pr-10"
            dir="rtl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="active">فعال</SelectItem>
            <SelectItem value="inactive">غير فعال</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users size={40} className="mx-auto mb-2 opacity-30" />
              <p>لا يوجد طلاب</p>
              <Button variant="outline" className="mt-2" onClick={openCreate}>
                <Plus size={16} className="ml-1" /> إضافة أول طالب
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium">الاسم</th>
                    <th className="text-right p-3 font-medium hidden sm:table-cell">الهاتف</th>
                    <th className="text-right p-3 font-medium hidden md:table-cell">الإيميل</th>
                    <th className="text-center p-3 font-medium">الدورات</th>
                    <th className="text-center p-3 font-medium hidden sm:table-cell">الحسابات</th>
                    <th className="text-center p-3 font-medium">المدفوعات</th>
                    <th className="text-center p-3 font-medium">الحالة</th>
                    <th className="text-center p-3 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{student.phone || student.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        {student.phone ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone size={12} />
                            <span dir="ltr">{student.phone}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        {student.email ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail size={12} />
                            <span dir="ltr">{student.email}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{student.courseEnrollments?.length || 0}</Badge>
                      </td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <Badge variant="outline">{student.fundedAccountSales?.length || 0}</Badge>
                      </td>
                      <td className="p-3 text-center font-medium">${student.totalPaid.toFixed(0)}</td>
                      <td className="p-3 text-center">
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {student.status === 'active' ? 'فعال' : 'غير فعال'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => viewDetail(student.id)} title="عرض التفاصيل">
                            <Eye size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(student)} title="تعديل">
                            <Edit size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => { setStudentToDelete({id: student.id, name: student.name}); setDeleteDialogOpen(true); }} title="حذف">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطالب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الطالب &quot;{studentToDelete?.name}&quot;؟ سيتم حذف جميع بيانات الطالب وتسجيلاته ومدفوعاته نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
