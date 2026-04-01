
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useNavigation } from '@/components/shared/navigation-context'
import {
  ArrowRight, Plus, Phone, Mail, GraduationCap, Wallet, DollarSign,
  Calendar, Pencil, Trash2, Save, StickyNote, X, CheckCircle2, Clock,
  Ban, MinusCircle, Edit, Eye, BookOpen, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStudentDetails, useStudentEntityMutations, useStudentEnrollments, useStudentFundedSales, useStudentPayments, useCourses, useAccountTypes } from '@/hooks/students/use-student'

// ---- Constants ----

const paymentStatusMap: Record<string, string> = {
  paid: 'مدفوع',
  partial: 'جزئي',
  pending: 'معلق',
  cancelled: 'ملغي',
}

const paymentMethodMap: Record<string, string> = {
  cash: 'نقداً',
  bank_transfer: 'تحويل بنكي',
  crypto: 'عملات رقمية',
  other: 'أخرى',
}

const paymentStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'default'
    case 'partial': return 'secondary'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

const paymentStatusIcon = (status: string) => {
  switch (status) {
    case 'paid': return <CheckCircle2 className="h-3.5 w-3.5" />
    case 'partial': return <MinusCircle className="h-3.5 w-3.5" />
    case 'cancelled': return <Ban className="h-3.5 w-3.5" />
    default: return <Clock className="h-3.5 w-3.5" />
  }
}

const avatarColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
]

// ---- Loading Skeleton ----

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-l from-primary/5 to-primary/10 px-6 py-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <Skeleton className="h-14 w-14 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </Card>
      {/* Summary skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-14" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-full rounded-lg" />
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </Card>
    </div>
  )
}

// ---- Main Component ----

export function StudentDetail() {
  const { selectedStudentId, setCurrentPage } = useNavigation()
  const { data: student, isLoading: studentLoading } = useStudentDetails(selectedStudentId)
    const mutations = useStudentEntityMutations(selectedStudentId || '')
  const { data: enrollments = [] } = useStudentEnrollments(selectedStudentId)
  const { data: fundedSales = [] } = useStudentFundedSales(selectedStudentId)
  const { data: payments = [] } = useStudentPayments(selectedStudentId)
  const { data: courses = [] } = useCourses()
  const { data: accountTypes = [] } = useAccountTypes()
  
  const loading = studentLoading

  // Dialog states
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [fundedDialogOpen, setFundedDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Forms
  const [enrollForm, setEnrollForm] = useState({ courseId: '', amountPaid: 0, paymentStatus: 'pending', notes: '' })
  const [fundedForm, setFundedForm] = useState({ accountTypeId: '', amountPaid: 0, paymentStatus: 'pending', notes: '' })
  const [paymentForm, setPaymentForm] = useState({ amount: 0, method: 'cash', description: '', date: '' })
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' })

  // Notes editing
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')

  // Toggling status
  const [togglingStatus, setTogglingStatus] = useState(false)

  // ---- Data Loading ----





  // ---- Handlers ----

  const handleToggleStatus = async () => {
    if (!student || !mutations) return
    setTogglingStatus(true)
    try {
      const newStatus = student.status === 'active' ? 'inactive' : 'active'
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, status: newStatus }),
      })
      if (res.ok) {
        toast.success(newStatus === 'active' ? 'تم تفعيل الطالب' : 'تم تعطيل الطالب')
      } else {
        toast.error('فشل في تحديث الحالة')
      }
    } catch { toast.error('فشل في تحديث الحالة') }
    setTogglingStatus(false)
  }

  const handleEditStudent = async () => {
    if (!student || !editForm.name.trim()) { toast.error('اسم الطالب مطلوب'); return }
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, ...editForm }),
      })
      if (res.ok) {
        setEditDialogOpen(false)
        toast.success('تم تحديث بيانات الطالب')
      } else {
        toast.error('فشل في التحديث')
      }
    } catch { toast.error('فشل في التحديث') }
  }

  const handleDeleteStudent = async () => {
    if (!student || !mutations) return
    try {
      await mutations.deleteEntity.mutateAsync({ endpoint: 'students', id: student.id })
      setCurrentPage('students')
    } catch (e) {
      toast.error('فشل في حذف الطالب')
    }
  }

  const handleSaveNotes = async () => {
    if (!student) return
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, notes: notesValue }),
      })
      if (res.ok) {
        setIsEditingNotes(false)
        toast.success('تم حفظ الملاحظات')
      } else {
        toast.error('فشل في حفظ الملاحظات')
      }
    } catch { toast.error('فشل في حفظ الملاحظات') }
  }

  const handleEnroll = async () => {
    if (!enrollForm.courseId) { toast.error('اختر دورة'); return }
    if (!mutations) return
    try {
      await mutations.addEnrollment.mutateAsync({ courseId: enrollForm.courseId, amountPaid: enrollForm.amountPaid, paymentStatus: enrollForm.paymentStatus, notes: enrollForm.notes })
      setEnrollDialogOpen(false)
      setEnrollForm({ courseId: '', amountPaid: 0, paymentStatus: 'pending', notes: '' })
    } catch (e) {
      toast.error('فشل في التسجيل')
    }
  }

  const handleFundedSale = async () => {
    if (!fundedForm.accountTypeId) { toast.error('اختر نوع الحساب'); return }
    if (!mutations) return
    try {
      await mutations.addFundedAccount.mutateAsync({ accountTypeId: fundedForm.accountTypeId, amountPaid: fundedForm.amountPaid, paymentStatus: fundedForm.paymentStatus, notes: fundedForm.notes })
      setFundedDialogOpen(false)
      setFundedForm({ accountTypeId: '', amountPaid: 0, paymentStatus: 'pending', notes: '' })
    } catch (e) {
      toast.error('فشل في إتمام البيع')
    }
  }

  const handlePayment = async () => {
    if (!paymentForm.amount || paymentForm.amount <= 0) { toast.error('أدخل المبلغ'); return }
    if (!mutations) return
    try {
      await mutations.addPayment.mutateAsync({ amount: paymentForm.amount, method: paymentForm.method, description: paymentForm.description, date: paymentForm.date })
      setPaymentDialogOpen(false)
      setPaymentForm({ amount: 0, method: 'cash', description: '', date: '' })
    } catch (e) {
      toast.error('فشل في تسجيل الدفعة')
    }
  }

  const handleDeleteEnrollment = async (id: string) => {
    if (!mutations) return
    try {
      await mutations.deleteEntity.mutateAsync({ endpoint: 'enrollments', id })
    } catch (e) {
      toast.error('فشل في حذف التسجيل')
    }
  }

  const handleDeleteFundedSale = async (id: string) => {
    if (!mutations) return
    try {
      await mutations.deleteEntity.mutateAsync({ endpoint: 'funded-sales', id })
    } catch (e) {
      toast.error('فشل في حذف عملية البيع')
    }
  }

  const handleDeletePayment = async (id: string) => {
    if (!mutations) return
    try {
      await mutations.deleteEntity.mutateAsync({ endpoint: 'payments', id })
    } catch (e) {
      toast.error('فشل في حذف الدفعة')
    }
  }

  const handleUpdateEnrollPaymentStatus = async (id: string, status: string) => {
    if (!mutations) return
    try {
      const enrollment = enrollments.find(e => e.id === id)
      if (!enrollment) return
      await mutations.updatePaymentStatus.mutateAsync({ endpoint: 'enrollments', id, data: { paymentStatus: status, amountPaid: enrollment.amountPaid } })
    } catch (e) {
      toast.error('فشل في تحديث حالة الدفع')
    }
  }

  const handleUpdateFundedPaymentStatus = async (id: string, status: string) => {
    if (!mutations) return
    try {
      const sale = fundedSales.find(f => f.id === id)
      if (!sale) return
      await mutations.updatePaymentStatus.mutateAsync({ endpoint: 'funded-sales', id, data: { paymentStatus: status, amountPaid: sale.amountPaid } })
    } catch (e) {
      toast.error('فشل في تحديث حالة الدفع')
    }
  }

  // ---- Computed Values ----

  const totalPayments = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  const sortedPayments = [...payments].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalEnrollPrice = enrollments.reduce((s: number, e: any) => s + (e.course?.price || 0), 0)
  const totalEnrollPaid = enrollments.reduce((s: number, e: any) => s + (e.amountPaid || 0), 0)
  const totalFundedPrice = fundedSales.reduce((s: number, f: any) => s + (f.accountType?.sellingPrice || 0), 0)
  const totalFundedPaid = fundedSales.reduce((s: number, f: any) => s + (f.amountPaid || 0), 0)
  const totalPrice = totalEnrollPrice + totalFundedPrice
  const totalPaid = totalEnrollPaid + totalFundedPaid
  const totalRemaining = totalPrice - totalPaid

  const avatarColor = student
    ? avatarColors[student.name.charCodeAt(0) % avatarColors.length]
    : 'bg-blue-500'

  // Unified subscriptions list: combine enrollments + funded sales, sorted by date desc
  const allSubscriptions = [
    ...enrollments.map((en: any) => ({
      id: en.id,
      type: 'course' as const,
      date: en.enrolledAt,
      name: en.course?.name || '—',
      price: en.course?.price || 0,
      paid: en.amountPaid || 0,
      remaining: (en.course?.price || 0) - (en.amountPaid || 0),
      status: en.paymentStatus,
      deleteHandler: () => handleDeleteEnrollment(en.id),
    })),
    ...fundedSales.map((sale: any) => ({
      id: sale.id,
      type: 'funded' as const,
      date: sale.soldAt,
      name: sale.accountType?.name || '—',
      accountSize: sale.accountType?.accountSize || 0,
      price: sale.accountType?.sellingPrice || 0,
      paid: sale.amountPaid || 0,
      remaining: (sale.accountType?.sellingPrice || 0) - (sale.amountPaid || 0),
      status: sale.paymentStatus,
      deleteHandler: () => handleDeleteFundedSale(sale.id),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // ---- Render ----

  const isLoading = studentLoading || loading

  if (isLoading) return <LoadingSkeleton />
  if (!student) return (
    <div className="text-center py-12 text-muted-foreground">
      <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-30" />
      <p className="text-lg font-medium">لم يتم العثور على الطالب</p>
      <p className="text-sm mt-1">قد يكون الطالب قد تم حذفه</p>
      <Button
        variant="outline"
        className="mt-4 gap-2"
        onClick={() => setCurrentPage('students')}
      >
        <ArrowRight size={16} />
        العودة لقائمة الطلاب
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* ===== Header Section ===== */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-l from-primary/5 to-primary/10 px-6 py-5">
          <div className="flex items-start gap-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 shrink-0"
              onClick={() => setCurrentPage('students')}
            >
              <ArrowRight size={20} />
            </Button>

            {/* Avatar */}
            <div className={`${avatarColor} w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md`}>
              {student.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-xl font-bold">{student.name}</h2>
                <Badge
                  variant={student.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs px-2.5 py-0.5"
                >
                  {student.status === 'active' ? '✅ فعال' : '⏸️ غير فعال'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                {student.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="shrink-0" />
                    <span dir="ltr">{student.phone}</span>
                  </span>
                )}
                {student.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="shrink-0" />
                    <span dir="ltr">{student.email}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="shrink-0" />
                  انضم في {new Date(student.createdAt).toLocaleDateString('ar')}
                </span>
              </div>
              {/* Total amount paid prominently */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="text-green-600" size={16} />
                </div>
                <span className="text-sm text-muted-foreground">إجمالي المدفوعات:</span>
                <span className="text-lg font-bold text-green-600">${totalPayments.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Dialog open={editDialogOpen} onOpenChange={(open) => {
                setEditDialogOpen(open)
                if (open) setEditForm({ name: student.name, phone: student.phone || '', email: student.email || '' })
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit size={14} />
                    <span className="hidden sm:inline">تعديل</span>
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader><DialogTitle>تعديل بيانات الطالب</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>الاسم *</Label>
                      <Input
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>الهاتف</Label>
                      <Input
                        value={editForm.phone}
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        dir="ltr"
                        type="email"
                      />
                    </div>
                    <Button onClick={handleEditStudent} className="w-full gap-2">
                      <Save size={16} />
                      حفظ التعديلات
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant={student.status === 'active' ? 'secondary' : 'default'}
                size="sm"
                className="gap-1.5"
                onClick={handleToggleStatus}
                disabled={togglingStatus}
              >
                {togglingStatus ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : student.status === 'active' ? (
                  <Eye size={14} />
                ) : (
                  <Eye size={14} />
                )}
                <span className="hidden sm:inline">
                  {student.status === 'active' ? 'تعطيل' : 'تفعيل'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== Summary Cards Row ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <GraduationCap className="text-purple-600" size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">الدورات المسجل فيها</p>
              <p className="font-bold text-lg">{enrollments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Wallet className="text-emerald-600" size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">الحسابات الممولة</p>
              <p className="font-bold text-lg">{fundedSales.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <DollarSign className="text-green-600" size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">إجمالي المدفوعات</p>
              <p className="font-bold text-lg text-green-600">${totalPaid.toFixed(0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg ${totalRemaining > 0 ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center shrink-0`}>
              <AlertTriangle className={totalRemaining > 0 ? 'text-red-500' : 'text-green-600'} size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">المتبقي</p>
              <p className={`font-bold text-lg ${totalRemaining > 0 ? 'text-red-500' : 'text-green-600'}`}>
                ${totalRemaining.toFixed(0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== Tabs ===== */}
      <Tabs defaultValue="subscriptions" dir="rtl">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="subscriptions">
            🔗 الاشتراكات ({allSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen size={14} className="inline ml-1" />
            الدورات ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="funded">
            💰 الحسابات ({fundedSales.length})
          </TabsTrigger>
          <TabsTrigger value="payments">
            💵 المدفوعات ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            📝 الملاحظات
          </TabsTrigger>
        </TabsList>

        {/* ===== Tab 1: All Subscriptions (DEFAULT) ===== */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              عرض جميع اشتراكات الطالب (دورات + حسابات ممولة) في مكان واحد
            </p>
            <div className="flex gap-2">
              <Dialog open={fundedDialogOpen} onOpenChange={setFundedDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                    <Plus size={14} />
                    حساب ممول
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader><DialogTitle>شراء حساب ممول</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>نوع الحساب *</Label>
                      <Select value={fundedForm.accountTypeId} onValueChange={v => {
                        setFundedForm({ ...fundedForm, accountTypeId: v })
                        const at = accountTypes.find(a => a.id === v)
                        if (at) setFundedForm(prev => ({ ...prev, amountPaid: at.sellingPrice }))
                      }}>
                        <SelectTrigger><SelectValue placeholder="اختر نوع الحساب" /></SelectTrigger>
                        <SelectContent>
                          {accountTypes.filter(a => a.isActive).map(a => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} (${a.sellingPrice} بيع | ${a.accountSize.toLocaleString()} حجم)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Profit info */}
                    {fundedForm.accountTypeId && (() => {
                      const at = accountTypes.find(a => a.id === fundedForm.accountTypeId)
                      if (!at) return null
                      const profit = (at.sellingPrice || 0) - (at.costPrice || 0)
                      return (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">سعر البيع:</span>
                              <p className="font-bold font-mono" dir="ltr">${at.sellingPrice}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">التكلفة:</span>
                              <p className="font-bold font-mono" dir="ltr">${at.costPrice}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">الربح:</span>
                              <p className="font-bold font-mono text-green-600" dir="ltr">${profit.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>المبلغ المدفوع</Label>
                        <Input
                          type="number"
                          value={fundedForm.amountPaid || ''}
                          onChange={e => setFundedForm({ ...fundedForm, amountPaid: Number(e.target.value) })}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label>حالة الدفع</Label>
                        <Select value={fundedForm.paymentStatus} onValueChange={v => setFundedForm({ ...fundedForm, paymentStatus: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">مدفوع</SelectItem>
                            <SelectItem value="partial">جزئي</SelectItem>
                            <SelectItem value="pending">معلق</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>ملاحظات</Label>
                      <Textarea value={fundedForm.notes} onChange={e => setFundedForm({ ...fundedForm, notes: e.target.value })} />
                    </div>
                    <Button onClick={handleFundedSale} className="w-full">شراء</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus size={14} />
                    دورة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader><DialogTitle>تسجيل في دورة جديدة</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>الدورة *</Label>
                      <Select value={enrollForm.courseId} onValueChange={v => {
                        setEnrollForm({ ...enrollForm, courseId: v })
                        const course = courses.find(c => c.id === v)
                        if (course) setEnrollForm(prev => ({ ...prev, amountPaid: course.price }))
                      }}>
                        <SelectTrigger><SelectValue placeholder="اختر دورة" /></SelectTrigger>
                        <SelectContent>
                          {courses.filter(c => c.isActive).map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name} - ${c.price}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>المبلغ المدفوع</Label>
                        <Input
                          type="number"
                          value={enrollForm.amountPaid || ''}
                          onChange={e => setEnrollForm({ ...enrollForm, amountPaid: Number(e.target.value) })}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label>حالة الدفع</Label>
                        <Select value={enrollForm.paymentStatus} onValueChange={v => setEnrollForm({ ...enrollForm, paymentStatus: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">مدفوع</SelectItem>
                            <SelectItem value="partial">جزئي</SelectItem>
                            <SelectItem value="pending">معلق</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>ملاحظات</Label>
                      <Textarea value={enrollForm.notes} onChange={e => setEnrollForm({ ...enrollForm, notes: e.target.value })} />
                    </div>
                    <Button onClick={handleEnroll} className="w-full">تسجيل</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {allSubscriptions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">لا توجد اشتراكات</p>
              <p className="text-sm mt-1">سجل الطالب في دورة أو قم بشراء حساب ممول</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pr-4">التاريخ</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الاسم</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>المدفوع</TableHead>
                        <TableHead>المتبقي</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead className="text-left pl-4">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allSubscriptions.map(sub => (
                        <TableRow key={`${sub.type}-${sub.id}`} className={sub.type === 'course' ? 'hover:bg-purple-50/50' : 'hover:bg-emerald-50/50'}>
                          <TableCell className="pr-4 text-sm text-muted-foreground">
                            {new Date(sub.date).toLocaleDateString('ar')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs gap-1 ${sub.type === 'course'
                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                              }`}
                              variant="outline"
                            >
                              {sub.type === 'course' ? (
                                <><GraduationCap size={12} /> دورة</>
                              ) : (
                                <><Wallet size={12} /> حساب ممول</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <span>{sub.name}</span>
                              {sub.type === 'funded' && sub.accountSize > 0 && (
                                <span className="text-xs text-muted-foreground block" dir="ltr">
                                  ${sub.accountSize.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell dir="ltr" className="font-mono">${sub.price.toFixed(2)}</TableCell>
                          <TableCell dir="ltr" className="font-mono">${sub.paid.toFixed(2)}</TableCell>
                          <TableCell>
                            {sub.remaining > 0 ? (
                              <span dir="ltr" className="font-mono text-red-500 font-semibold">
                                ${sub.remaining.toFixed(2)}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                <CheckCircle2 size={14} />
                                مدفوع
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={paymentStatusVariant(sub.status)} className="text-xs gap-1">
                              {paymentStatusIcon(sub.status)}
                              {paymentStatusMap[sub.status] || sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-left pl-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={sub.deleteHandler}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-muted/30 font-bold">
                        <TableCell colSpan={3} className="pr-4">الإجمالي</TableCell>
                        <TableCell dir="ltr" className="font-mono">${totalPrice.toFixed(2)}</TableCell>
                        <TableCell dir="ltr" className="font-mono text-green-600">${totalPaid.toFixed(2)}</TableCell>
                        <TableCell>
                          <span dir="ltr" className={`font-mono ${totalRemaining > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            ${totalRemaining.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Tab 2: Courses Only ===== */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus size={16} /> تسجيل في دورة جديدة</Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader><DialogTitle>تسجيل الطالب في دورة</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>الدورة *</Label>
                    <Select value={enrollForm.courseId} onValueChange={v => {
                      setEnrollForm({ ...enrollForm, courseId: v })
                      const course = courses.find(c => c.id === v)
                      if (course) setEnrollForm(prev => ({ ...prev, amountPaid: course.price }))
                    }}>
                      <SelectTrigger><SelectValue placeholder="اختر دورة" /></SelectTrigger>
                      <SelectContent>
                        {courses.filter(c => c.isActive).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name} - ${c.price}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>المبلغ المدفوع</Label>
                      <Input
                        type="number"
                        value={enrollForm.amountPaid || ''}
                        onChange={e => setEnrollForm({ ...enrollForm, amountPaid: Number(e.target.value) })}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label>حالة الدفع</Label>
                      <Select value={enrollForm.paymentStatus} onValueChange={v => setEnrollForm({ ...enrollForm, paymentStatus: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">مدفوع</SelectItem>
                          <SelectItem value="partial">جزئي</SelectItem>
                          <SelectItem value="pending">معلق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea value={enrollForm.notes} onChange={e => setEnrollForm({ ...enrollForm, notes: e.target.value })} />
                  </div>
                  <Button onClick={handleEnroll} className="w-full">تسجيل</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {enrollments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">لا توجد تسجيلات في دورات</p>
              <p className="text-sm mt-1">اضغط &quot;تسجيل في دورة جديدة&quot; لإضافة تسجيل</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pr-4">اسم الدورة</TableHead>
                        <TableHead>تاريخ التسجيل</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>المدفوع</TableHead>
                        <TableHead>المتبقي</TableHead>
                        <TableHead>حالة الدفع</TableHead>
                        <TableHead className="text-left pl-4">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map(en => {
                        const remaining = (en.course?.price || 0) - (en.amountPaid || 0)
                        return (
                          <TableRow key={en.id}>
                            <TableCell className="font-medium pr-4">{en.course?.name}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(en.enrolledAt).toLocaleDateString('ar')}
                            </TableCell>
                            <TableCell dir="ltr" className="font-mono">${(en.course?.price || 0).toFixed(2)}</TableCell>
                            <TableCell dir="ltr" className="font-mono">${(en.amountPaid || 0).toFixed(2)}</TableCell>
                            <TableCell>
                              {remaining > 0 ? (
                                <span dir="ltr" className="font-mono text-red-500 font-semibold">${remaining.toFixed(2)}</span>
                              ) : (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                  <CheckCircle2 size={14} />
                                  مدفوع
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={en.paymentStatus}
                                onValueChange={v => handleUpdateEnrollPaymentStatus(en.id, v)}
                              >
                                <SelectTrigger className="w-28 h-8 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    {paymentStatusIcon(en.paymentStatus)}
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="paid">✅ مدفوع</SelectItem>
                                  <SelectItem value="partial">⏳ جزئي</SelectItem>
                                  <SelectItem value="pending">⏸️ معلق</SelectItem>
                                  <SelectItem value="cancelled">❌ ملغي</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-left pl-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteEnrollment(en.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="pr-4 font-semibold">الإجمالي</TableCell>
                        <TableCell dir="ltr" className="font-mono font-semibold">${totalEnrollPrice.toFixed(2)}</TableCell>
                        <TableCell dir="ltr" className="font-mono font-semibold">${totalEnrollPaid.toFixed(2)}</TableCell>
                        <TableCell>
                          <span dir="ltr" className={`font-mono font-semibold ${(totalEnrollPrice - totalEnrollPaid) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            ${(totalEnrollPrice - totalEnrollPaid).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Tab 3: Funded Accounts Only ===== */}
        <TabsContent value="funded" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={fundedDialogOpen} onOpenChange={setFundedDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus size={16} /> شراء حساب ممول</Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader><DialogTitle>شراء حساب ممول للطالب</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>نوع الحساب *</Label>
                    <Select value={fundedForm.accountTypeId} onValueChange={v => {
                      setFundedForm({ ...fundedForm, accountTypeId: v })
                      const at = accountTypes.find(a => a.id === v)
                      if (at) setFundedForm(prev => ({ ...prev, amountPaid: at.sellingPrice }))
                    }}>
                      <SelectTrigger><SelectValue placeholder="اختر نوع الحساب" /></SelectTrigger>
                      <SelectContent>
                        {accountTypes.filter(a => a.isActive).map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} (${a.sellingPrice} بيع | ${a.accountSize.toLocaleString()} حجم)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Profit info */}
                  {fundedForm.accountTypeId && (() => {
                    const at = accountTypes.find(a => a.id === fundedForm.accountTypeId)
                    if (!at) return null
                    const profit = (at.sellingPrice || 0) - (at.costPrice || 0)
                    return (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">سعر البيع:</span>
                            <p className="font-bold font-mono" dir="ltr">${at.sellingPrice}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">التكلفة:</span>
                            <p className="font-bold font-mono" dir="ltr">${at.costPrice}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الربح:</span>
                            <p className="font-bold font-mono text-green-600" dir="ltr">${profit.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>المبلغ المدفوع</Label>
                      <Input
                        type="number"
                        value={fundedForm.amountPaid || ''}
                        onChange={e => setFundedForm({ ...fundedForm, amountPaid: Number(e.target.value) })}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label>حالة الدفع</Label>
                      <Select value={fundedForm.paymentStatus} onValueChange={v => setFundedForm({ ...fundedForm, paymentStatus: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">مدفوع</SelectItem>
                          <SelectItem value="partial">جزئي</SelectItem>
                          <SelectItem value="pending">معلق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea value={fundedForm.notes} onChange={e => setFundedForm({ ...fundedForm, notes: e.target.value })} />
                  </div>
                  <Button onClick={handleFundedSale} className="w-full">شراء</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {fundedSales.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">لا توجد حسابات ممولة</p>
              <p className="text-sm mt-1">اضغط &quot;شراء حساب ممول&quot; لإضافة</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pr-4">نوع الحساب</TableHead>
                        <TableHead>حجم الحساب</TableHead>
                        <TableHead>سعر البيع</TableHead>
                        <TableHead>التكلفة</TableHead>
                        <TableHead>الربح</TableHead>
                        <TableHead>المدفوع</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-left pl-4">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundedSales.map(sale => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium pr-4">{sale.accountType?.name}</TableCell>
                          <TableCell dir="ltr" className="font-mono">${(sale.accountType?.accountSize || 0).toLocaleString()}</TableCell>
                          <TableCell dir="ltr" className="font-mono">${(sale.accountType?.sellingPrice || 0).toFixed(2)}</TableCell>
                          <TableCell dir="ltr" className="font-mono">${(sale.accountType?.costPrice || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <span dir="ltr" className={`font-mono font-semibold ${(sale.amountPaid - (sale.accountType?.costPrice || 0)) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              ${(sale.amountPaid - (sale.accountType?.costPrice || 0)).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell dir="ltr" className="font-mono">${(sale.amountPaid || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={paymentStatusVariant(sale.paymentStatus)} className="text-xs gap-1">
                              {paymentStatusIcon(sale.paymentStatus)}
                              {paymentStatusMap[sale.paymentStatus] || sale.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(sale.soldAt).toLocaleDateString('ar')}
                          </TableCell>
                          <TableCell className="text-left pl-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteFundedSale(sale.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="font-semibold">الإجمالي</TableCell>
                        <TableCell dir="ltr" className="font-mono font-semibold text-green-600">
                          ${fundedSales.reduce((s: number, f: any) => s + (f.amountPaid - (f.accountType?.costPrice || 0)), 0).toFixed(2)}
                        </TableCell>
                        <TableCell dir="ltr" className="font-mono font-semibold">
                          ${totalFundedPaid.toFixed(2)}
                        </TableCell>
                        <TableCell colSpan={3}></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Tab 4: Payment History ===== */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus size={16} /> تسجيل دفعة</Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader><DialogTitle>تسجيل دفعة جديدة</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>المبلغ *</Label>
                    <Input
                      type="number"
                      value={paymentForm.amount || ''}
                      onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                      placeholder="0"
                      dir="ltr"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>طريقة الدفع</Label>
                      <Select value={paymentForm.method} onValueChange={v => setPaymentForm({ ...paymentForm, method: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">نقداً</SelectItem>
                          <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                          <SelectItem value="crypto">عملات رقمية</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>التاريخ</Label>
                      <Input
                        type="date"
                        value={paymentForm.date}
                        onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      value={paymentForm.description}
                      onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handlePayment} className="w-full">تسجيل</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {payments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">لا توجد مدفوعات مسجلة</p>
              <p className="text-sm mt-1">اضغط &quot;تسجيل دفعة&quot; لإضافة دفعة جديدة</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pr-4">التاريخ</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>طريقة الدفع</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead>الرصيد التراكمي</TableHead>
                        <TableHead className="text-left pl-4">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPayments.map((p, idx) => {
                        const runningBalance = sortedPayments.slice(0, idx + 1).reduce((s, x) => s + (x.amount || 0), 0)
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="pr-4 text-muted-foreground text-sm">
                              {new Date(p.date).toLocaleDateString('ar')}
                            </TableCell>
                            <TableCell dir="ltr" className="font-mono font-semibold text-green-600">
                              ${(p.amount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {paymentMethodMap[p.method] || p.method || '—'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                              {p.description || '—'}
                            </TableCell>
                            <TableCell dir="ltr" className="font-mono text-green-600 font-medium">
                              ${runningBalance.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-left pl-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeletePayment(p.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="pr-4 font-semibold">الإجمالي</TableCell>
                        <TableCell dir="ltr" className="font-mono font-bold text-green-600">
                          ${totalPayments.toFixed(2)}
                        </TableCell>
                        <TableCell colSpan={4}></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Tab 5: Notes ===== */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <StickyNote size={18} className="text-amber-500" />
                ملاحظات الطالب
              </CardTitle>
              {!isEditingNotes ? (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                  setNotesValue(student.notes || '')
                  setIsEditingNotes(true)
                }}>
                  <Pencil size={14} />
                  تعديل
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5" onClick={handleSaveNotes}>
                    <Save size={14} />
                    حفظ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      setIsEditingNotes(false)
                      setNotesValue(student.notes || '')
                    }}
                  >
                    <X size={14} />
                    إلغاء
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <Textarea
                  value={notesValue}
                  onChange={e => setNotesValue(e.target.value)}
                  placeholder="أضف ملاحظات عن الطالب..."
                  rows={6}
                  className="resize-y"
                  autoFocus
                />
              ) : student.notes ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{student.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  لا توجد ملاحظات. اضغط &quot;تعديل&quot; لإضافة ملاحظات.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== Danger Zone ===== */}
      <Card className="border-2 border-destructive/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-destructive">منطقة الخطر</h3>
                <p className="text-xs text-muted-foreground">
                  حذف الطالب سيؤدي إلى حذف جميع بياناته المرتبطة نهائياً بما في ذلك التسجيلات والحسابات الممولة والمدفوعات
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 size={14} />
                  حذف الطالب
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من حذف الطالب؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف الطالب &quot;{student.name}&quot; وجميع بياناته المرتبطة بما في ذلك
                    التسجيلات في الدورات والحسابات الممولة والمدفوعات. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteStudent}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    نعم، احذف الطالب
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}