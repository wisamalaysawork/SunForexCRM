'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus, Edit, Trash2, GraduationCap, DollarSign, Users, Eye,
  CheckCircle2, AlertCircle, Clock, XCircle, ChevronDown, ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigation } from '@/components/shared/navigation-context'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Course {
  id: string
  name: string
  description: string | null
  price: number
  isActive: boolean
  _count: { enrollments: number }
}

interface Enrollment {
  id: string
  studentId: string
  courseId: string
  enrolledAt: string
  paymentStatus: string
  amountPaid: number
  notes: string | null
  student: { id: string; name: string; phone: string | null }
  course: { id: string; name: string; price: number }
}

interface Student {
  id: string
  name: string
  phone: string | null
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  paid: { label: 'مدفوع', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-950', icon: <CheckCircle2 size={14} /> },
  partial: { label: 'جزئي', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-950', icon: <Clock size={14} /> },
  pending: { label: 'معلق', color: 'text-yellow-700 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-950', icon: <AlertCircle size={14} /> },
  cancelled: { label: 'ملغي', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-950', icon: <XCircle size={14} /> },
}

function getStatusBadge(status: string) {
  const cfg = statusConfig[status] || statusConfig.pending
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

function getPaymentBorderColor(enrollments: Enrollment[]): string {
  if (enrollments.length === 0) return 'border-t-slate-300 dark:border-t-slate-600'
  const allPaid = enrollments.every(e => e.paymentStatus === 'paid')
  if (allPaid) return 'border-t-emerald-500'
  const hasPending = enrollments.some(e => e.paymentStatus === 'pending' || e.paymentStatus === 'partial')
  if (hasPending) return 'border-t-amber-400'
  return 'border-t-slate-300 dark:border-t-slate-600'
}

function getPaymentStatusIcon(enrollments: Enrollment[]): { icon: React.ReactNode; color: string; label: string } {
  if (enrollments.length === 0) return { icon: <AlertCircle size={16} />, color: 'text-slate-400', label: 'لا يوجد طلاب' }
  const allPaid = enrollments.every(e => e.paymentStatus === 'paid')
  if (allPaid) return { icon: <CheckCircle2 size={16} />, color: 'text-emerald-500', label: 'جميع الدفعات مكتملة' }
  const hasPending = enrollments.some(e => e.paymentStatus === 'pending' || e.paymentStatus === 'partial')
  if (hasPending) return { icon: <Clock size={16} />, color: 'text-amber-500', label: 'دفعات معلّقة' }
  return { icon: <CheckCircle2 size={16} />, color: 'text-emerald-500', label: 'مكتمل' }
}

// ──────────────────────────────────────────────
// Loading Skeleton
// ──────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Course Cards Grid */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-l from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {/* Students Table Skeleton */}
      <div>
        <Skeleton className="h-6 w-28 mb-4" />
        <Card className="p-0">
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function CoursesManager() {
  const { setCurrentPage, setSelectedStudentId } = useNavigation()

  // Data
  const [courses, setCourses] = useState<Course[]>([])
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // UI State
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [studentSearch, setStudentSearch] = useState('')

  // Course Form
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: 0, isActive: true })

  // Enrollment Form
  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    paymentStatus: 'pending',
    amountPaid: 0,
  })

  // ──────────────────────────────────────────────
  // Data Loading
  // ──────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [courseRes, enrollRes, studentRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/enrollments'),
          fetch('/api/students'),
        ])
        if (!cancelled) {
          setCourses(await courseRes.json())
          setAllEnrollments(await enrollRes.json())
          setStudents(await studentRes.json())
        }
      } catch {
        if (!cancelled) toast.error('فشل في تحميل البيانات')
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [refreshKey])

  // ──────────────────────────────────────────────
  // Computed Values
  // ──────────────────────────────────────────────

  const activeCourses = courses.filter(c => c.isActive).length
  const totalRevenue = allEnrollments
    .filter(e => e.paymentStatus !== 'cancelled')
    .reduce((s, e) => s + e.amountPaid, 0)
  const uniqueStudents = new Set(allEnrollments.map(e => e.studentId)).size

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null
  const selectedCourseEnrollments = allEnrollments.filter(e => e.courseId === selectedCourseId)

  const getCourseEnrollments = (courseId: string) =>
    allEnrollments.filter(e => e.courseId === courseId)

  const getCourseStats = (courseId: string) => {
    const enrollments = getCourseEnrollments(courseId)
    const revenue = enrollments.filter(e => e.paymentStatus !== 'cancelled').reduce((s, e) => s + e.amountPaid, 0)
    const totalPotential = enrollments.length * (courses.find(c => c.id === courseId)?.price || 0)
    const pendingCount = enrollments.filter(e => e.paymentStatus === 'pending').length
    const partialCount = enrollments.filter(e => e.paymentStatus === 'partial').length
    const paidCount = enrollments.filter(e => e.paymentStatus === 'paid').length
    return { revenue, totalPotential, pendingCount, partialCount, paidCount, total: enrollments.length }
  }

  // Filter students for dropdown (exclude already enrolled in selected course)
  const availableStudents = students.filter(s => {
    const alreadyEnrolled = selectedCourseEnrollments.some(e => e.studentId === s.id)
    if (alreadyEnrolled) return false
    if (!studentSearch.trim()) return true
    return s.name.includes(studentSearch) || (s.phone && s.phone.includes(studentSearch))
  })

  // ──────────────────────────────────────────────
  // Course CRUD
  // ──────────────────────────────────────────────

  const openCreateCourse = () => {
    setEditCourse(null)
    setForm({ name: '', description: '', price: 0, isActive: true })
    setCourseDialogOpen(true)
  }

  const openEditCourse = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditCourse(course)
    setForm({ name: course.name, description: course.description || '', price: course.price, isActive: course.isActive })
    setCourseDialogOpen(true)
  }

  const handleSaveCourse = async () => {
    if (!form.name.trim()) { toast.error('اسم الدورة مطلوب'); return }
    try {
      if (editCourse) {
        await fetch('/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editCourse.id, ...form }),
        })
        toast.success('تم تحديث الدورة بنجاح')
      } else {
        await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        toast.success('تم إنشاء الدورة بنجاح')
      }
      setCourseDialogOpen(false)
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('فشل في حفظ الدورة')
    }
  }

  const confirmDeleteCourse = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setCourseToDelete(course)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return
    try {
      await fetch(`/api/courses?id=${courseToDelete.id}`, { method: 'DELETE' })
      toast.success('تم حذف الدورة بنجاح')
      if (selectedCourseId === courseToDelete.id) setSelectedCourseId(null)
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('فشل في حذف الدورة')
    }
  }

  // ──────────────────────────────────────────────
  // Enrollment
  // ──────────────────────────────────────────────

  const openEnrollDialog = () => {
    if (!selectedCourse) return
    setEnrollForm({
      studentId: '',
      paymentStatus: 'pending',
      amountPaid: 0,
    })
    setStudentSearch('')
    setEnrollDialogOpen(true)
  }

  const handleEnrollStudent = async () => {
    if (!selectedCourse || !enrollForm.studentId) {
      toast.error('يرجى اختيار طالب')
      return
    }
    try {
      await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: enrollForm.studentId,
          courseId: selectedCourse.id,
          paymentStatus: enrollForm.paymentStatus,
          amountPaid: enrollForm.amountPaid,
        }),
      })
      toast.success('تم تسجيل الطالب بنجاح')
      setEnrollDialogOpen(false)
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('فشل في تسجيل الطالب')
    }
  }

  const handleRemoveEnrollment = async (enrollmentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      await fetch(`/api/enrollments?id=${enrollmentId}`, { method: 'DELETE' })
      toast.success('تم إلغاء التسجيل')
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('فشل في إلغاء التسجيل')
    }
  }

  // ──────────────────────────────────────────────
  // Navigation
  // ──────────────────────────────────────────────

  const navigateToStudent = (studentId: string) => {
    setSelectedStudentId(studentId)
    setCurrentPage('student-detail')
  }

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">منتجات التدريب</h2>
          <p className="text-muted-foreground mt-1">
            {courses.length} دورة تدريبية • {uniqueStudents} طالب مسجّل
          </p>
        </div>
        <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateCourse} className="gap-2">
              <Plus size={18} />
              إضافة دورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editCourse ? 'تعديل الدورة' : 'إنشاء دورة جديدة'}</DialogTitle>
              <DialogDescription>
                {editCourse ? 'قم بتعديل بيانات الدورة الحالية هنا.' : 'أدخل بيانات الدورة التدريبية الجديدة.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="course-name">اسم الدورة *</Label>
                <Input
                  id="course-name"
                  name="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: دورة التداول الأساسية"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-description">الوصف</Label>
                <Textarea
                  id="course-description"
                  name="description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر للدورة..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-price">السعر ($)</Label>
                <Input
                  id="course-price"
                  name="price"
                  type="number"
                  value={form.price || ''}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  dir="ltr"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="course-active"
                  checked={form.isActive}
                  onCheckedChange={v => setForm({ ...form, isActive: v })}
                />
                <Label htmlFor="course-active">دورة نشطة</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSaveCourse}>
                {editCourse ? 'تحديث' : 'إنشاء'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── Summary Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <GraduationCap className="text-purple-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">إجمالي الدورات</p>
              <p className="text-xl font-bold">{courses.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">دورات نشطة</p>
              <p className="text-xl font-bold text-green-600">{activeCourses}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Users className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">إجمالي الطلاب</p>
              <p className="text-xl font-bold">{uniqueStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <DollarSign className="text-emerald-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">إجمالي الإيرادات</p>
              <p className="text-xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Course Product Cards ─── */}
      <div>
        <h3 className="text-lg font-semibold mb-4">الدورات التدريبية</h3>
        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <GraduationCap size={48} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground text-lg mb-1">لا يوجد دورات بعد</p>
            <p className="text-sm text-muted-foreground mb-4">أنشئ أول دورة تدريبية لبدء تسجيل الطلاب</p>
            <Button onClick={openCreateCourse} className="gap-2">
              <Plus size={16} /> إنشاء أول دورة
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map(course => {
              const stats = getCourseStats(course.id)
              const enrollments = getCourseEnrollments(course.id)
              const paymentIndicator = getPaymentStatusIcon(enrollments)
              const borderColor = getPaymentBorderColor(enrollments)
              const isSelected = selectedCourseId === course.id

              return (
                <Card
                  key={course.id}
                  className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer border-t-4 ${borderColor} ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''} ${!course.isActive ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedCourseId(isSelected ? null : course.id)}
                >
                  {/* Card Top - Product Header */}
                  <div className="relative bg-gradient-to-l from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                          <GraduationCap className="text-white" size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base leading-snug truncate">{course.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-medium ${paymentIndicator.color}`}>
                              {paymentIndicator.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xl font-bold text-green-600">${course.price.toLocaleString()}</span>
                        <Badge variant={course.isActive ? 'default' : 'secondary'} className="text-[10px] px-1.5">
                          {course.isActive ? 'نشطة' : 'متوقفة'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Description */}
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">الطلاب</p>
                        <p className="text-sm font-bold flex items-center justify-center gap-1">
                          <Users size={12} className="text-muted-foreground" />
                          {stats.total}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">الإيرادات</p>
                        <p className="text-sm font-bold text-emerald-600">${stats.revenue.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">معلّق</p>
                        <p className="text-sm font-bold text-amber-600">{stats.pendingCount + stats.partialCount}</p>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    {stats.total > 0 && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {stats.paidCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                            <CheckCircle2 size={11} /> {stats.paidCount} مدفوع
                          </span>
                        )}
                        {stats.partialCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            <Clock size={11} /> {stats.partialCount} جزئي
                          </span>
                        )}
                        {stats.pendingCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-yellow-600 font-medium">
                            <AlertCircle size={11} /> {stats.pendingCount} معلّق
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={e => openEditCourse(course, e)}
                      >
                        <Edit size={13} /> تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        className="flex-1 gap-1.5"
                        onClick={e => { e.stopPropagation(); setSelectedCourseId(course.id) }}
                      >
                        <Eye size={13} /> {isSelected ? 'إخفاء' : 'الطلاب'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={e => confirmDeleteCourse(course, e)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Selected Course - Students Table ─── */}
      {selectedCourse && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">
                طلاب دورة: {selectedCourse.name}
              </h3>
              <Badge variant="secondary">{selectedCourseEnrollments.length} طالب</Badge>
            </div>
            <Button onClick={openEnrollDialog} className="gap-2">
              <Plus size={16} /> تسجيل طالب جديد
            </Button>
          </div>

          {/* Course Revenue Summary Bar */}
          {(() => {
            const stats = getCourseStats(selectedCourse.id)
            return (
              <Card className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">سعر الدورة</p>
                    <p className="text-lg font-bold">${selectedCourse.price.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">المبالغ المحصّلة</p>
                    <p className="text-lg font-bold text-green-600">${stats.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">المتبقي</p>
                    <p className={`text-lg font-bold ${stats.totalPotential - stats.revenue > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      ${(stats.totalPotential - stats.revenue).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">نسبة التحصيل</p>
                    <p className="text-lg font-bold">
                      {stats.totalPotential > 0 ? Math.round((stats.revenue / stats.totalPotential) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </Card>
            )
          })()}

          {/* Students Table */}
          {selectedCourseEnrollments.length === 0 ? (
            <Card className="p-12 text-center">
              <Users size={40} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-lg mb-1">لا يوجد طلاب مسجّلين في هذه الدورة</p>
              <p className="text-sm text-muted-foreground mb-4">قم بتسجيل أول طالب في الدورة</p>
              <Button onClick={openEnrollDialog} className="gap-2">
                <Plus size={16} /> تسجيل طالب جديد
              </Button>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-right font-semibold">الطالب</TableHead>
                      <TableHead className="text-center font-semibold">الهاتف</TableHead>
                      <TableHead className="text-center font-semibold">تاريخ التسجيل</TableHead>
                      <TableHead className="text-center font-semibold">سعر الدورة</TableHead>
                      <TableHead className="text-center font-semibold">المدفوع</TableHead>
                      <TableHead className="text-center font-semibold">المتبقي</TableHead>
                      <TableHead className="text-center font-semibold">حالة الدفع</TableHead>
                      <TableHead className="text-center font-semibold">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCourseEnrollments.map(enrollment => {
                      const remaining = enrollment.course.price - enrollment.amountPaid
                      return (
                        <TableRow key={enrollment.id} className="group">
                          <TableCell>
                            <button
                              className="font-semibold text-primary hover:underline text-right"
                              onClick={() => navigateToStudent(enrollment.studentId)}
                            >
                              {enrollment.student?.name}
                            </button>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground text-sm" dir="ltr">
                            {enrollment.student?.phone || '—'}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground text-sm" dir="ltr">
                            {new Date(enrollment.enrolledAt).toLocaleDateString('en-CA')}
                          </TableCell>
                          <TableCell className="text-center font-medium" dir="ltr">
                            ${enrollment.course.price.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center font-medium text-green-600" dir="ltr">
                            ${enrollment.amountPaid.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center font-bold" dir="ltr">
                            <span className={remaining > 0 ? 'text-red-500' : 'text-green-600'}>
                              ${remaining.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(enrollment.paymentStatus)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => navigateToStudent(enrollment.studentId)}
                                title="عرض بيانات الطالب"
                              >
                                <Eye size={15} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={(e) => handleRemoveEnrollment(enrollment.id, e)}
                                title="إلغاء التسجيل"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="hover:bg-transparent font-bold">
                      <TableCell>الإجمالي</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-center" dir="ltr">
                        ${(selectedCourseEnrollments.reduce((s, e) => s + e.course.price, 0)).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center text-green-600" dir="ltr">
                        ${(selectedCourseEnrollments.filter(e => e.paymentStatus !== 'cancelled').reduce((s, e) => s + e.amountPaid, 0)).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center" dir="ltr">
                        <span className={(() => {
                          const total = selectedCourseEnrollments.reduce((s, e) => s + (e.course.price - e.amountPaid), 0)
                          return total > 0 ? 'text-red-500' : 'text-green-600'
                        })()}>
                          ${(selectedCourseEnrollments.reduce((s, e) => s + (e.course.price - e.amountPaid), 0)).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </ScrollArea>
            </Card>
          )}
        </div>
      )}

      {/* ─── Enroll Student Dialog ─── */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="text-emerald-600" size={20} />
              تسجيل طالب في دورة {selectedCourse?.name}
            </DialogTitle>
            <DialogDescription>
              اختر طالباً من القائمة وحدد مبلغ الدفع المبدئي لتسجيله في هذه الدورة.
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4 py-2">
              {/* Course Info */}
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">الدورة</p>
                <p className="font-semibold">{selectedCourse.name}</p>
                <p className="text-sm text-green-600 font-medium mt-1">
                  السعر: ${selectedCourse.price.toLocaleString()}
                </p>
              </div>

              {/* Student Select */}
              <div className="space-y-2">
                <Label htmlFor="enroll-student-select">اختر الطالب *</Label>
                <Select
                  value={enrollForm.studentId}
                  onValueChange={v => setEnrollForm({ ...enrollForm, studentId: v })}
                >
                  <SelectTrigger id="enroll-student-select" className="w-full">
                    <SelectValue placeholder="اختر طالباً..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        id="enroll-student-search"
                        name="student-search"
                        placeholder="بحث بالاسم أو الهاتف..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {availableStudents.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {studentSearch ? 'لا توجد نتائج' : 'جميع الطلاب مسجّلون بالفعل'}
                      </div>
                    ) : (
                      availableStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex items-center gap-2">
                            <span>{student.name}</span>
                            {student.phone && (
                              <span className="text-muted-foreground text-xs" dir="ltr">{student.phone}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <Label htmlFor="enroll-payment-status">حالة الدفع</Label>
                <Select
                  value={enrollForm.paymentStatus}
                  onValueChange={v => {
                    setEnrollForm({
                      ...enrollForm,
                      paymentStatus: v,
                      amountPaid: v === 'paid' ? selectedCourse.price : 0,
                    })
                  }}
                >
                  <SelectTrigger id="enroll-payment-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-yellow-500" /> معلّق
                      </span>
                    </SelectItem>
                    <SelectItem value="partial">
                      <span className="flex items-center gap-2">
                        <Clock size={14} className="text-amber-500" /> جزئي
                      </span>
                    </SelectItem>
                    <SelectItem value="paid">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-green-500" /> مدفوع بالكامل
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Paid */}
              <div className="space-y-2">
                <Label htmlFor="enroll-amount-paid">المبلغ المدفوع ($)</Label>
                <Input
                  id="enroll-amount-paid"
                  name="amountPaid"
                  type="number"
                  value={enrollForm.amountPaid || ''}
                  onChange={e => setEnrollForm({ ...enrollForm, amountPaid: Number(e.target.value) })}
                  dir="ltr"
                  disabled={enrollForm.paymentStatus === 'paid'}
                  placeholder="0"
                  max={selectedCourse.price}
                />
                {enrollForm.paymentStatus === 'paid' && (
                  <p className="text-xs text-muted-foreground">تم تعبئة المبلغ تلقائياً (مدفوع بالكامل)</p>
                )}
              </div>

              {/* Preview */}
              {enrollForm.amountPaid > 0 && enrollForm.paymentStatus === 'partial' && (
                <div className="p-3 rounded-lg border space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">سعر الدورة</span>
                    <span>${selectedCourse.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المدفوع</span>
                    <span className="text-green-600">-${enrollForm.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between text-sm font-bold">
                    <span>المتبقي</span>
                    <span className="text-red-500">${(selectedCourse.price - enrollForm.amountPaid).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleEnrollStudent} disabled={!enrollForm.studentId}>
              تسجيل الطالب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Course Confirmation Dialog ─── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هذا الإجراء سيقوم بحذف الدورة وجميع التسجيلات المرتبطة بها بشكل نهائي.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-muted-foreground">
              هل أنت متأكد من حذف الدورة &quot;{courseToDelete?.name}&quot;؟
            </p>
            {courseToDelete && getCourseStats(courseToDelete.id).total > 0 && (
              <p className="text-sm text-red-500 mt-2">
                ⚠️ هذه الدورة لديها {getCourseStats(courseToDelete.id).total} تسجيلات سيتم حذفها أيضاً.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              <Trash2 size={14} className="ml-1" /> حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
