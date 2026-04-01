'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus, Edit, Trash2, Wallet, TrendingUp, DollarSign, Eye,
  Users, ArrowUpRight, ArrowDownRight, Package, Search
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigation } from '@/components/shared/navigation-context'

// ─── Types ───────────────────────────────────────────────────────
interface AccountType {
  id: string
  name: string
  accountSize: number
  sellingPrice: number
  costPrice: number
  isActive: boolean
  _count: { sales: number }
}

interface FundedSale {
  id: string
  studentId: string
  accountTypeId: string
  soldAt: string
  paymentStatus: string
  amountPaid: number
  profit: number
  notes: string | null
  student: { id: string; name: string; phone: string | null }
  accountType: { id: string; name: string; accountSize: number; sellingPrice: number; costPrice: number }
}

interface StudentOption {
  id: string
  name: string
  phone: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────
function formatDollar(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  paid: { label: 'مدفوع', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-950' },
  partial: { label: 'جزئي', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  pending: { label: 'معلق', color: 'text-yellow-700 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-950' },
  cancelled: { label: 'ملغي', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-950' },
}

function getStatusBadge(status: string) {
  const cfg = statusConfig[status] || statusConfig.pending
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ─── Avatar Color ────────────────────────────────────────────────
function getAvatarColor(name: string): string {
  const colors = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-violet-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
    'from-lime-500 to-green-600',
    'from-fuchsia-500 to-pink-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// ─── Loading Skeleton ────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Account Type Cards */}
      <div>
        <Skeleton className="h-6 w-36 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[1, 2, 3].map(j => (
                  <Skeleton key={j} className="h-14 rounded-lg" />
                ))}
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div>
        <Skeleton className="h-6 w-32 mb-3" />
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────
export function FundedAccountsManager() {
  const { setCurrentPage, setSelectedStudentId } = useNavigation()
  const studentsTableRef = useRef<HTMLDivElement>(null)

  // Data states
  const [accounts, setAccounts] = useState<AccountType[]>([])
  const [sales, setSales] = useState<FundedSale[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // UI states
  const [activeTab, setActiveTab] = useState<string>('all')
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'account'; id: string; name: string } | { type: 'sale'; id: string; name: string } | null>(null)
  const [selectedAccountForAdd, setSelectedAccountForAdd] = useState<AccountType | null>(null)

  // Account form
  const [editAccount, setEditAccount] = useState<AccountType | null>(null)
  const [form, setForm] = useState({ name: '', accountSize: 0, sellingPrice: 0, costPrice: 0, isActive: true })

  // Add student form
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    paymentStatus: 'pending' as string,
    amountPaid: 0,
  })
  const [studentSearch, setStudentSearch] = useState('')
  const [addingStudent, setAddingStudent] = useState(false)

  // ─── Data Fetching ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [accRes, salesRes, stuRes] = await Promise.all([
          fetch('/api/funded-accounts'),
          fetch('/api/funded-sales'),
          fetch('/api/students'),
        ])
        if (!cancelled) {
          setAccounts(await accRes.json())
          const rawSales = await salesRes.json()
          setSales(rawSales.map((s: any) => ({ ...s, profit: s.amountPaid - (s.accountType?.costPrice || 0) })))
          const stuData = await stuRes.json()
          setStudents(stuData.map((s: { id: string; name: string; phone: string | null }) => ({ id: s.id, name: s.name, phone: s.phone })))
        }
      } catch {
        if (!cancelled) toast.error('فشل في تحميل البيانات')
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [refreshKey])

  // ─── Calculations ─────────────────────────────────────────────
  const totalRevenue = sales.reduce((sum, s) => sum + s.amountPaid, 0)
  const totalCost = sales.reduce((sum, s) => sum + (s.accountType?.costPrice || 0), 0)
  const totalProfit = sales.filter(s => s.paymentStatus !== 'cancelled').reduce((sum, s) => sum + s.profit, 0)
  const totalStudentsCount = new Set(sales.filter(s => s.paymentStatus !== 'cancelled').map(s => s.studentId)).size

  const formProfit = form.sellingPrice - form.costPrice
  const formMargin = form.sellingPrice > 0 ? (formProfit / form.sellingPrice) * 100 : 0

  // Filtered sales based on active tab
  const filteredSales = activeTab === 'all'
    ? sales
    : sales.filter(s => s.accountTypeId === activeTab)

  const filteredSortedSales = [...filteredSales].sort(
    (a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime()
  )

  // Filtered student options (exclude students already in this account type)
  const existingStudentIds = selectedAccountForAdd
    ? sales.filter(s => s.accountTypeId === selectedAccountForAdd.id).map(s => s.studentId)
    : []

  const filteredStudentOptions = students
    .filter(s => !existingStudentIds.includes(s.id))
    .filter(s =>
      studentSearch === '' ||
      s.name.includes(studentSearch) ||
      (s.phone && s.phone.includes(studentSearch))
    )

  // ─── Account CRUD ─────────────────────────────────────────────
  const openCreateAccount = () => {
    setEditAccount(null)
    setForm({ name: '', accountSize: 0, sellingPrice: 0, costPrice: 0, isActive: true })
    setAccountDialogOpen(true)
  }

  const openEditAccount = (a: AccountType) => {
    setEditAccount(a)
    setForm({ name: a.name, accountSize: a.accountSize, sellingPrice: a.sellingPrice, costPrice: a.costPrice, isActive: a.isActive })
    setAccountDialogOpen(true)
  }

  const handleSaveAccount = async () => {
    if (!form.name.trim()) { toast.error('اسم الحساب مطلوب'); return }
    try {
      if (editAccount) {
        await fetch('/api/funded-accounts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editAccount.id, ...form }),
        })
        toast.success('تم تحديث نوع الحساب بنجاح')
      } else {
        await fetch('/api/funded-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        toast.success('تم إنشاء نوع الحساب بنجاح')
      }
      setAccountDialogOpen(false)
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('فشل في الحفظ')
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteTarget || deleteTarget.type !== 'account') return
    try {
      await fetch(`/api/funded-accounts?id=${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('تم حذف نوع الحساب بنجاح')
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      setActiveTab('all')
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('فشل في الحذف')
    }
  }

  // ─── Sale CRUD ────────────────────────────────────────────────
  const openAddStudent = (acc: AccountType) => {
    setSelectedAccountForAdd(acc)
    setStudentForm({ studentId: '', paymentStatus: 'pending', amountPaid: 0 })
    setStudentSearch('')
    setAddStudentDialogOpen(true)
  }

  const handleAddStudent = async () => {
    if (!studentForm.studentId || !selectedAccountForAdd) {
      toast.error('يرجى اختيار طالب')
      return
    }
    setAddingStudent(true)
    try {
      await fetch('/api/funded-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentForm.studentId,
          accountTypeId: selectedAccountForAdd.id,
          paymentStatus: studentForm.paymentStatus,
          amountPaid: studentForm.amountPaid,
        }),
      })
      toast.success('تمت إضافة الطالب بنجاح')
      setAddStudentDialogOpen(false)
      setSelectedAccountForAdd(null)
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('فشل في إضافة الطالب')
    }
    setAddingStudent(false)
  }

  const handleDeleteSale = async () => {
    if (!deleteTarget || deleteTarget.type !== 'sale') return
    try {
      await fetch(`/api/funded-sales?id=${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('تم حذف عملية البيع بنجاح')
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('فشل في الحذف')
    }
  }

  // ─── Navigation ───────────────────────────────────────────────
  const viewStudentDetail = (studentId: string) => {
    setCurrentPage('student-detail')
    setSelectedStudentId(studentId)
  }

  const handleAccountCardClick = (acc: AccountType) => {
    setActiveTab(acc.id)
    setTimeout(() => {
      studentsTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="text-emerald-600" size={28} />
            الحسابات الممولة
          </h2>
          <p className="text-muted-foreground mt-1">إدارة منتجات الحسابات الممولة ومتابعة مبيعاتها</p>
        </div>
        <Button onClick={openCreateAccount} className="gap-2 shadow-md">
          <Plus size={18} />
          إضافة نوع حساب
        </Button>
      </div>

      {/* ─── Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <DollarSign className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">إجمالي الإيرادات</p>
              <p className="text-lg font-bold text-blue-600">{formatDollar(totalRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="text-white rotate-180" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">إجمالي التكاليف</p>
              <p className="text-lg font-bold text-red-500">{formatDollar(totalCost)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">صافي الربح</p>
              <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {totalProfit >= 0 ? '+' : ''}{formatDollar(totalProfit)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Users className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">عدد العملاء</p>
              <p className="text-lg font-bold text-violet-600">{totalStudentsCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Account Type Product Cards ───────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Package size={18} />
          أنواع الحسابات (المنتجات)
          <Badge variant="secondary" className="text-xs">{accounts.length}</Badge>
        </h3>

        {accounts.length === 0 ? (
          <Card className="p-12 text-center">
            <Wallet className="mx-auto text-muted-foreground/40 mb-3" size={48} />
            <p className="text-muted-foreground mb-4">لا يوجد أنواع حسابات بعد</p>
            <Button variant="outline" onClick={openCreateAccount} className="gap-2">
              <Plus size={16} /> إضافة أول نوع حساب
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {accounts.map(acc => {
              const profit = acc.sellingPrice - acc.costPrice
              const margin = acc.sellingPrice > 0 ? (profit / acc.sellingPrice) * 100 : 0
              const accSales = sales.filter(s => s.accountTypeId === acc.id)
              const accRevenue = accSales.filter(s => s.paymentStatus !== 'cancelled').reduce((s, sale) => s + sale.amountPaid, 0)
              const accProfitTotal = accSales.filter(s => s.paymentStatus !== 'cancelled').reduce((s, sale) => s + sale.profit, 0)
              const isSelected = activeTab === acc.id

              return (
                <Card
                  key={acc.id}
                  className={`p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 border-emerald-300 dark:border-emerald-700 shadow-emerald-100 dark:shadow-emerald-950/30'
                      : 'hover:-translate-y-0.5'
                  } ${!acc.isActive ? 'opacity-50' : ''}`}
                  onClick={() => handleAccountCardClick(acc)}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
                        acc.isActive
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        <Wallet className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{acc.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          حجم الحساب: <span className="font-medium text-foreground">{formatDollar(acc.accountSize)}</span>
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={acc.isActive ? 'default' : 'secondary'}
                      className={`text-[10px] ${acc.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : ''}`}
                    >
                      {acc._count.sales} طالب
                    </Badge>
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">سعر البيع</p>
                      <p className="text-sm font-bold text-blue-600">{formatDollar(acc.sellingPrice)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">التكلفة</p>
                      <p className="text-sm font-bold text-red-500">{formatDollar(acc.costPrice)}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg text-center ${
                      profit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-red-50 dark:bg-red-950/50'
                    }`}>
                      <p className="text-[10px] text-muted-foreground mb-0.5">الربح/وحدة</p>
                      <p className={`text-sm font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {profit >= 0 ? '+' : ''}{formatDollar(profit)}
                      </p>
                    </div>
                  </div>

                  {/* Profit Margin Bar */}
                  {acc.sellingPrice > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            margin >= 0 ? 'bg-gradient-to-l from-emerald-400 to-emerald-600' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(Math.abs(margin), 100)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {/* Revenue Summary */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 px-1">
                    <span>إجمالي الإيرادات: <strong className="text-blue-600">{formatDollar(accRevenue)}</strong></span>
                    <span>الربح: <strong className={accProfitTotal >= 0 ? 'text-emerald-600' : 'text-red-500'}>{accProfitTotal >= 0 ? '+' : ''}{formatDollar(accProfitTotal)}</strong></span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 text-xs"
                      onClick={() => openEditAccount(acc)}
                    >
                      <Edit size={13} /> تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      onClick={() => openAddStudent(acc)}
                    >
                      <Plus size={13} /> إضافة طالب
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                      onClick={() => {
                        setDeleteTarget({ type: 'account', id: acc.id, name: acc.name })
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Students per Account Type ────────────────────────────── */}
      <div ref={studentsTableRef}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={18} />
            الطلاب المشترين
            <Badge variant="secondary" className="text-xs">{filteredSortedSales.length}</Badge>
          </h3>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="all" className="text-xs gap-1">
              الكل
              <Badge variant="secondary" className="text-[10px] px-1.5">{sales.length}</Badge>
            </TabsTrigger>
            {accounts.map(acc => (
              <TabsTrigger key={acc.id} value={acc.id} className="text-xs gap-1">
                {acc.name}
                <Badge variant="secondary" className="text-[10px] px-1.5">{acc._count.sales}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All / Per-account content */}
          {accounts.map(acc => (
            <TabsContent key={acc.id} value={acc.id}>
              <StudentTable
                sales={filteredSortedSales}
                viewStudentDetail={viewStudentDetail}
                onDeleteSale={(id, name) => {
                  setDeleteTarget({ type: 'sale', id, name })
                  setDeleteDialogOpen(true)
                }}
              />
              {/* Add Student Button for this account type */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                  onClick={() => openAddStudent(acc)}
                >
                  <Plus size={16} />
                  إضافة طالب إلى {acc.name}
                </Button>
              </div>
            </TabsContent>
          ))}

          <TabsContent value="all">
            <StudentTable
              sales={filteredSortedSales}
              viewStudentDetail={viewStudentDetail}
              onDeleteSale={(id, name) => {
                setDeleteTarget({ type: 'sale', id, name })
                setDeleteDialogOpen(true)
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Create/Edit Account Dialog ────────────────────────────── */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="text-emerald-600" size={20} />
              {editAccount ? 'تعديل نوع الحساب' : 'إضافة نوع حساب جديد'}
            </DialogTitle>
            <DialogDescription>
              {editAccount ? 'قم بتعديل بيانات نوع الحساب' : 'أدخل بيانات نوع الحساب الجديد'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">اسم الحساب <span className="text-red-500">*</span></Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: حساب 5,000$"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1.5 block">حجم الحساب ($)</Label>
                <Input
                  type="number"
                  value={form.accountSize || ''}
                  onChange={e => setForm({ ...form, accountSize: Number(e.target.value) })}
                  dir="ltr"
                  placeholder="5000"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">سعر البيع ($)</Label>
                <Input
                  type="number"
                  value={form.sellingPrice || ''}
                  onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                  dir="ltr"
                  placeholder="100"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">التكلفة ($)</Label>
                <Input
                  type="number"
                  value={form.costPrice || ''}
                  onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })}
                  dir="ltr"
                  placeholder="40"
                />
              </div>
            </div>

            {/* Visual Profit Calculator */}
            <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-950 dark:to-emerald-950/20 p-4 space-y-3">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <TrendingUp size={16} />
                حاسبة الأرباح
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-blue-100/80 dark:bg-blue-950/60">
                  <p className="text-[10px] text-muted-foreground mb-0.5">سعر البيع</p>
                  <p className="text-lg font-bold text-blue-600">{formatDollar(form.sellingPrice)}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-red-100/80 dark:bg-red-950/60">
                  <p className="text-[10px] text-muted-foreground mb-0.5">التكلفة</p>
                  <p className="text-lg font-bold text-red-500">{formatDollar(form.costPrice)}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${formProfit >= 0 ? 'bg-green-100/80 dark:bg-green-950/60' : 'bg-red-100/80 dark:bg-red-950/60'}`}>
                  <p className="text-[10px] text-muted-foreground mb-0.5">الربح</p>
                  <p className={`text-lg font-bold ${formProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formProfit >= 0 ? '+' : ''}{formatDollar(formProfit)}
                  </p>
                </div>
              </div>
              {form.sellingPrice > 0 && form.costPrice > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
                  <span className="text-xs text-muted-foreground">هامش الربح</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${formMargin >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(formMargin), 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${formMargin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {formMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
              <Label>حساب نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveAccount} className="gap-2">
              {editAccount ? <Edit size={16} /> : <Plus size={16} />}
              {editAccount ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Student Dialog ────────────────────────────────────── */}
      <Dialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="text-emerald-600" size={20} />
              إضافة طالب إلى {selectedAccountForAdd?.name}
            </DialogTitle>
            <DialogDescription>
              اختر طالباً وأضفه إلى هذا النوع من الحسابات
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Account Info Summary */}
            {selectedAccountForAdd && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نوع الحساب:</span>
                  <span className="font-medium">{selectedAccountForAdd.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">حجم الحساب:</span>
                  <span className="font-medium">{formatDollar(selectedAccountForAdd.accountSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">السعر:</span>
                  <span className="font-bold text-blue-600">{formatDollar(selectedAccountForAdd.sellingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الربح المتوقع:</span>
                  <span className={`font-bold ${selectedAccountForAdd.sellingPrice - selectedAccountForAdd.costPrice >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedAccountForAdd.sellingPrice - selectedAccountForAdd.costPrice >= 0 ? '+' : ''}
                    {formatDollar(selectedAccountForAdd.sellingPrice - selectedAccountForAdd.costPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Student Search */}
            <div>
              <Label className="mb-1.5 block">اختر الطالب <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم الهاتف..."
                  className="pr-9"
                />
              </div>
              {studentForm.studentId && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-sm">
                  <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${getAvatarColor(
                    students.find(s => s.id === studentForm.studentId)?.name || ''
                  )} flex items-center justify-center text-white text-xs font-bold`}>
                    {(students.find(s => s.id === studentForm.studentId)?.name || '').charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{students.find(s => s.id === studentForm.studentId)?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{students.find(s => s.id === studentForm.studentId)?.phone}</p>
                  </div>
                </div>
              )}
              {!studentForm.studentId && (
                <ScrollArea className="h-32 mt-2 rounded-lg border">
                  <div className="p-1">
                    {filteredStudentOptions.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {existingStudentIds.length === students.length
                          ? 'جميع الطلاب مسجلون في هذا الحساب بالفعل'
                          : 'لا يوجد نتائج'}
                      </div>
                    ) : (
                      filteredStudentOptions.slice(0, 10).map(stu => (
                        <button
                          key={stu.id}
                          className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-accent transition-colors text-right"
                          onClick={() => setStudentForm(prev => ({ ...prev, studentId: stu.id }))}
                        >
                          <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${getAvatarColor(stu.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {stu.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{stu.name}</p>
                            <p className="text-[11px] text-muted-foreground" dir="ltr">{stu.phone || '—'}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Payment Status */}
            <div>
              <Label className="mb-1.5 block">حالة الدفع</Label>
              <Select value={studentForm.paymentStatus} onValueChange={v => setStudentForm(prev => ({ ...prev, paymentStatus: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="partial">جزئي</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Paid */}
            <div>
              <Label className="mb-1.5 block">المبلغ المدفوع ($)</Label>
              <Input
                type="number"
                value={studentForm.amountPaid || ''}
                onChange={e => setStudentForm(prev => ({ ...prev, amountPaid: Number(e.target.value) }))}
                dir="ltr"
                placeholder={selectedAccountForAdd ? String(selectedAccountForAdd.sellingPrice) : '0'}
              />
              {selectedAccountForAdd && (
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>السعر الكامل: {formatDollar(selectedAccountForAdd.sellingPrice)}</span>
                  <span>المتبقي: <strong className="text-red-500">
                    {formatDollar(selectedAccountForAdd.sellingPrice - studentForm.amountPaid)}
                  </strong></span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStudentDialogOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleAddStudent}
              disabled={addingStudent || !studentForm.studentId}
              className="gap-2"
            >
              <Plus size={16} />
              {addingStudent ? 'جارٍ الإضافة...' : 'إضافة الطالب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'account'
                ? `هل أنت متأكد من حذف نوع الحساب "${deleteTarget.name}"؟ سيتم حذف جميع عمليات البيع المرتبطة به.`
                : `هل أنت متأكد من حذف عملية البيع للطالب "${deleteTarget?.name}"؟`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTarget?.type === 'account' ? handleDeleteAccount : handleDeleteSale}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Trash2 size={16} />
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Student Table Sub-Component ──────────────────────────────────
function StudentTable({
  sales,
  viewStudentDetail,
  onDeleteSale,
}: {
  sales: FundedSale[]
  viewStudentDetail: (id: string) => void
  onDeleteSale: (id: string, name: string) => void
}) {
  const totalRevenue = sales.reduce((sum, s) => sum + s.amountPaid, 0)
  const totalProfit = sales.filter(s => s.paymentStatus !== 'cancelled').reduce((sum, s) => sum + s.profit, 0)

  if (sales.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="mx-auto text-muted-foreground/40 mb-3" size={48} />
        <p className="text-muted-foreground">لا يوجد طلاب في هذا القسم بعد</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-right font-semibold">الطالب</TableHead>
                <TableHead className="text-right font-semibold">نوع الحساب</TableHead>
                <TableHead className="text-center font-semibold">هاتف</TableHead>
                <TableHead className="text-center font-semibold">تاريخ الشراء</TableHead>
                <TableHead className="text-center font-semibold">المبلغ المدفوع</TableHead>
                <TableHead className="text-center font-semibold">الحالة</TableHead>
                <TableHead className="text-center font-semibold">الربح</TableHead>
                <TableHead className="text-center font-semibold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map(sale => (
                <TableRow key={sale.id} className="hover:bg-accent/30 transition-colors">
                  {/* Student Name - Clickable */}
                  <TableCell>
                    <button
                      className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                      onClick={() => viewStudentDetail(sale.studentId)}
                    >
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarColor(sale.student?.name || '')} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {(sale.student?.name || '').charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{sale.student?.name}</span>
                    </button>
                  </TableCell>
                  {/* Account Type */}
                  <TableCell className="text-sm text-muted-foreground">{sale.accountType?.name}</TableCell>
                  {/* Phone */}
                  <TableCell className="text-center text-sm text-muted-foreground" dir="ltr">
                    {sale.student?.phone || '—'}
                  </TableCell>
                  {/* Date */}
                  <TableCell className="text-center text-sm text-muted-foreground" dir="ltr">
                    {new Date(sale.soldAt).toLocaleDateString('en-CA')}
                  </TableCell>
                  {/* Amount Paid */}
                  <TableCell className="text-center font-medium">
                    <span className={sale.amountPaid > 0 ? 'text-blue-600' : 'text-muted-foreground'}>
                      {formatDollar(sale.amountPaid)}
                    </span>
                  </TableCell>
                  {/* Status */}
                  <TableCell className="text-center">{getStatusBadge(sale.paymentStatus)}</TableCell>
                  {/* Profit */}
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center gap-0.5 font-semibold text-sm ${
                      sale.paymentStatus === 'cancelled'
                        ? 'text-muted-foreground line-through'
                        : sale.profit >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {sale.paymentStatus !== 'cancelled' && (
                        sale.profit >= 0
                          ? <ArrowUpRight size={14} />
                          : <ArrowDownRight size={14} />
                      )}
                      {formatDollar(Math.abs(sale.profit))}
                    </span>
                  </TableCell>
                  {/* Actions */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                        onClick={() => viewStudentDetail(sale.studentId)}
                        title="عرض بيانات الطالب"
                      >
                        <Eye size={15} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                        onClick={() => onDeleteSale(sale.id, sale.student?.name || '')}
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell colSpan={4} className="font-bold text-sm">
                  الإجمالي ({sales.length} عملية)
                </TableCell>
                <TableCell className="text-center font-bold text-blue-600">
                  {formatDollar(totalRevenue)}
                </TableCell>
                <TableCell />
                <TableCell className="text-center font-bold text-emerald-600">
                  {totalProfit >= 0 ? '+' : ''}{formatDollar(totalProfit)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
