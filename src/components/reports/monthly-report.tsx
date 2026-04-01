'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  FileDown,
  GraduationCap,
  Wallet,
  Receipt,
} from 'lucide-react'
import { toast } from 'sonner'

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

const CATEGORY_LABELS: Record<string, string> = {
  rent: 'إيجارات',
  bills: 'فواتير',
  salaries: 'رواتب',
  marketing: 'تسويق',
  software: 'برمجيات',
  other: 'أخرى',
  funded_cost: 'تكاليف حسابات ممولة',
  debt_payment: 'سداد ديون',
}

interface ReportData {
  month: string
  year: number
  monthNum: number
  enrollments: any[]
  fundedSales: any[]
  payments: any[]
  expenses: any[]
  newStudents: any[]
  newDebts?: any[]
  debtPayments?: any[]
  partnerIncomes?: any[]
  totals: {
    enrollmentIncome: number
    fundedIncome: number
    fundedProfit: number
    totalPayments: number
    totalDebtReceived?: number
    totalDebtRepayments?: number
    totalPartnerIncome?: number
    totalExpenses: number
    totalIncome: number
    netProfit: number
    newStudentsCount: number
  }
  expensesByCategory: Record<string, { label: string; items: any[]; total: number }>
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

export function MonthlyReport() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [refreshKey, setRefreshKey] = useState(0)

  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/reports?month=${currentMonth}`)
        if (!cancelled) {
          const json = await res.json()
          if (json.error) {
            toast.error('فشل في تحميل البيانات')
            setData(null)
          } else {
            setData(json)
          }
        }
      } catch {
        if (!cancelled) toast.error('فشل في تحميل البيانات')
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [currentMonth, refreshKey])

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const formatCurrency = (val: number) => `$${val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const paymentMethodLabel = (method: string | null) => {
    switch (method) {
      case 'cash': return 'نقداً'
      case 'bank_transfer': return 'تحويل بنكي'
      case 'crypto': return 'عملات رقمية'
      default: return 'أخرى'
    }
  }

  const exportCSV = () => {
    if (!data) return

    const BOM = '\uFEFF'
    const lines: string[] = []

    const monthLabel = `${MONTHS_AR[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    lines.push(`تقرير شهري - ${monthLabel}`)
    lines.push('')

    // Income section
    lines.push('=== الإيرادات ===')
    lines.push('')

    // Enrollment income
    lines.push('دخل تسجيل الدورات')
    lines.push('الطالب,الدورة,التاريخ,المبلغ المدفوع,حالة الدفع')
    data.enrollments.forEach(e => {
      const status = e.paymentStatus === 'paid' ? 'مدفوع' : e.paymentStatus === 'partial' ? 'جزئي' : e.paymentStatus === 'pending' ? 'معلق' : 'ملغي'
      lines.push(`${e.student?.name || ''},${e.course?.name || ''},${formatDate(e.enrolledAt)},${e.amountPaid},${status}`)
    })
    lines.push(`الإجمالي,,${formatCurrency(data.totals.enrollmentIncome)}`)
    lines.push('')

    // Funded sales income
    lines.push('دخل بيع الحسابات الممولة')
    lines.push('الطالب,نوع الحساب,حجم الحساب,سعر البيع,المبلغ المدفوع,الربح,حالة الدفع')
    data.fundedSales.forEach(s => {
      const status = s.paymentStatus === 'paid' ? 'مدفوع' : s.paymentStatus === 'partial' ? 'جزئي' : s.paymentStatus === 'pending' ? 'معلق' : 'ملغي'
      lines.push(`${s.student?.name || ''},${s.accountType?.name || ''},${s.accountType?.accountSize || ''},${s.accountType?.sellingPrice || ''},${s.amountPaid},${s.profit},${status}`)
    })
    lines.push(`الإجمالي,,${formatCurrency(data.totals.fundedIncome)},الربح الإجمالي: ${formatCurrency(data.totals.fundedProfit)}`)
    lines.push('')

    // Direct payments
    lines.push('المدفوعات المباشرة')
    lines.push('الطالب,المبلغ,طريقة الدفع,الوصف,التاريخ')
    data.payments.forEach(p => {
      lines.push(`${p.student?.name || ''},${p.amount},${paymentMethodLabel(p.method)},${p.description || ''},${formatDate(p.date)}`)
    })
    lines.push(`إجمالي المدفوعات,,,${formatCurrency(data.totals.totalPayments)}`)
    lines.push('')

    // New Debts
    if (data.newDebts && data.newDebts.length > 0) {
      lines.push('تمويل / ديون جديدة')
      lines.push('المصدر,الوصف,التاريخ,المبلغ')
      data.newDebts.forEach(d => {
        lines.push(`${d.source},${d.description || ''},${formatDate(d.startDate)},${d.amount}`)
      })
      lines.push(`إجمالي التمويل,,,${formatCurrency(data.totals.totalDebtReceived || 0)}`)
      lines.push('')
    }

    // Partner Incomes
    if (data.partnerIncomes && data.partnerIncomes.length > 0) {
      lines.push('أرباح الشركاء')
      lines.push('الشريك,الوصف,التاريخ,المبلغ')
      data.partnerIncomes.forEach(i => {
        lines.push(`${i.partner?.name || ''},${i.description || ''},${formatDate(i.date)},${i.amount}`)
      })
      lines.push(`إجمالي أرباح الشركاء,,,${formatCurrency(data.totals.totalPartnerIncome || 0)}`)
      lines.push('')
    }

    lines.push(`إجمالي الإيرادات,,,${formatCurrency(data.totals.totalIncome)}`)
    lines.push('')

    // Expenses section
    lines.push('=== المصاريف ===')
    lines.push('')

    const categories = Object.keys(data.expensesByCategory).sort(
      (a, b) => data.expensesByCategory[b].total - data.expensesByCategory[a].total
    )

    categories.forEach(cat => {
      const catData = data.expensesByCategory[cat]
      lines.push(catData.label)
      lines.push('التاريخ,الوصف,المبلغ')
      catData.items.forEach(item => {
        lines.push(`${formatDate(item.date)},${item.description || '-'},${item.amount}`)
      })
      lines.push(`إجمالي ${catData.label},,${formatCurrency(catData.total)}`)
      lines.push('')
    })

    lines.push(`إجمالي المصاريف,,,${formatCurrency(data.totals.totalExpenses)}`)
    lines.push('')

    // P&L
    lines.push('=== تقرير الأرباح والخسائر ===')
    lines.push('')
    lines.push(`إجمالي الإيرادات,${formatCurrency(data.totals.totalIncome)}`)
    lines.push(`إجمالي المصاريف,${formatCurrency(data.totals.totalExpenses)}`)
    const profitLabel = data.totals.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'
    lines.push(`${profitLabel},${formatCurrency(Math.abs(data.totals.netProfit))}`)
    lines.push('')
    lines.push(`عدد الطلاب الجدد,${data.totals.newStudentsCount}`)

    const csvContent = BOM + lines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `تقرير_${monthLabel.replace(/\s/g, '_')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('تم تصدير التقرير بنجاح')
  }

  if (loading) return <LoadingSkeleton />
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Receipt size={48} className="mb-4 opacity-30" />
        <p>لا يوجد بيانات للعرض</p>
      </div>
    )
  }

  const categories = Object.keys(data.expensesByCategory).sort(
    (a, b) => data.expensesByCategory[b].total - data.expensesByCategory[a].total
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">التقارير الشهرية</h2>
          <p className="text-muted-foreground">تقرير مالي شامل بالتفصيل</p>
        </div>
        <Button onClick={exportCSV} className="gap-2">
          <FileDown size={18} />
          تصدير CSV
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronRight size={20} />
        </Button>
        <Card className="px-6 py-2">
          <p className="font-bold text-lg">
            {MONTHS_AR[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
        </Card>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronLeft size={20} />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
                <ArrowUpRight size={16} className="text-green-600" />
              </div>
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totals.totalIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">{data.payments.length} عملية دفع</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center">
                <ArrowDownRight size={16} className="text-red-600" />
              </div>
              إجمالي المصاريف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(data.totals.totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">{data.expenses.length} مصروف</p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${data.totals.netProfit >= 0 ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${data.totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.totals.netProfit >= 0 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {data.totals.netProfit >= 0 ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-600" />}
              </div>
              {data.totals.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${data.totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.totals.netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(data.totals.netProfit))}
            </p>
            <p className={`text-xs mt-1 ${data.totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.totals.netProfit >= 0 ? 'ربح شهري' : 'خسارة شهرية'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              الطلاب الجدد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{data.totals.newStudentsCount}</p>
            <p className="text-xs text-muted-foreground mt-1">طالب مسجل هذا الشهر</p>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            تفصيل الإيرادات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المصدر</TableHead>
                  <TableHead>التفاصيل</TableHead>
                  <TableHead>الطالب</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-left">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Course enrollment income */}
                {data.enrollments.length > 0 && data.enrollments.map(e => (
                  <TableRow key={`enr-${e.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-green-500" />
                        <Badge variant="outline" className="text-xs font-normal">تسجيل دورة</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{e.course?.name}</TableCell>
                    <TableCell className="text-sm">{e.student?.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(e.enrolledAt)}</TableCell>
                    <TableCell className="text-left font-medium text-green-600">{formatCurrency(e.amountPaid)}</TableCell>
                  </TableRow>
                ))}

                {/* Funded account sales income */}
                {data.fundedSales.length > 0 && data.fundedSales.map(s => (
                  <TableRow key={`fund-${s.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-purple-500" />
                        <Badge variant="outline" className="text-xs font-normal">حساب ممول</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.accountType?.name}</TableCell>
                    <TableCell className="text-sm">{s.student?.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(s.soldAt)}</TableCell>
                    <TableCell className="text-left font-medium text-green-600">{formatCurrency(s.amountPaid)}</TableCell>
                  </TableRow>
                ))}

                {/* Direct payments */}
                {data.payments.length > 0 && data.payments.map(p => (
                  <TableRow key={`pay-${p.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-emerald-500" />
                        <Badge variant="outline" className="text-xs font-normal">دفع مباشر</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {paymentMethodLabel(p.method)}
                      {p.description && ` - ${p.description}`}
                    </TableCell>
                    <TableCell className="text-sm">{p.student?.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(p.date)}</TableCell>
                    <TableCell className="text-left font-medium text-green-600">{formatCurrency(p.amount)}</TableCell>
                  </TableRow>
                ))}

                {/* New Debts */}
                {data.newDebts && data.newDebts.length > 0 && data.newDebts.map(d => (
                  <TableRow key={`debt-${d.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-orange-500" />
                        <Badge variant="outline" className="text-xs font-normal">تمويل / دين</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{d.description || 'أخذ دين جديد'}</TableCell>
                    <TableCell className="text-sm">{d.source}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(d.startDate)}</TableCell>
                    <TableCell className="text-left font-medium text-green-600">{formatCurrency(d.amount)}</TableCell>
                  </TableRow>
                ))}

                {/* Partner Incomes */}
                {data.partnerIncomes && data.partnerIncomes.length > 0 && data.partnerIncomes.map(i => (
                  <TableRow key={`partinc-${i.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowUpRight size={14} className="text-blue-500" />
                        <Badge variant="outline" className="text-xs font-normal">أرباح شركاء</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{i.description || 'عمولة شريك'}</TableCell>
                    <TableCell className="text-sm">{i.partner?.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(i.date)}</TableCell>
                    <TableCell className="text-left font-medium text-green-600">{formatCurrency(i.amount)}</TableCell>
                  </TableRow>
                ))}

                {data.enrollments.length === 0 && data.fundedSales.length === 0 && data.payments.length === 0 && (!data.newDebts || data.newDebts.length === 0) && (!data.partnerIncomes || data.partnerIncomes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا يوجد إيرادات في هذا الشهر
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="border-t bg-muted/30 px-4 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                دخل التسجيلات: <span className="font-medium text-foreground">{formatCurrency(data.totals.enrollmentIncome)}</span>
              </span>
              <span className="text-muted-foreground">
                دخل الحسابات الممولة: <span className="font-medium text-foreground">{formatCurrency(data.totals.fundedIncome)}</span>
              </span>
              <span className="font-bold text-green-600">
                إجمالي الإيرادات: {formatCurrency(data.totals.totalIncome)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt size={18} className="text-red-600" />
            تفصيل المصاريف
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">لا يوجد مصاريف في هذا الشهر</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map(cat => {
                    const catData = data.expensesByCategory[cat]
                    return (
                      <ExpenseCategoryGroup
                        key={cat}
                        category={cat}
                        label={catData.label}
                        items={catData.items}
                        total={catData.total}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                      />
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Total */}
          <div className="border-t bg-muted/30 px-4 py-3">
            <div className="flex justify-between font-bold text-red-600">
              <span>إجمالي المصاريف</span>
              <span>{formatCurrency(data.totals.totalExpenses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit & Loss Statement */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base">
            تقرير الأرباح والخسائر - {MONTHS_AR[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Revenue */}
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 space-y-3">
              <h3 className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                <ArrowUpRight size={16} />
                الإيرادات
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">دخل تسجيلات الدورات</span>
                  <span className="font-medium">{formatCurrency(data.totals.enrollmentIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">دخل بيع الحسابات الممولة</span>
                  <span className="font-medium">{formatCurrency(data.totals.fundedIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">مدفوعات مباشرة</span>
                  <span className="font-medium">{formatCurrency(data.totals.totalPayments)}</span>
                </div>
                {(data.totals.totalDebtReceived || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">تمويل / ديون جديدة</span>
                    <span className="font-medium">{formatCurrency(data.totals.totalDebtReceived || 0)}</span>
                  </div>
                )}
                {(data.totals.totalPartnerIncome || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">أرباح شركاء</span>
                    <span className="font-medium">{formatCurrency(data.totals.totalPartnerIncome || 0)}</span>
                  </div>
                )}
              </div>
              <Separator className="bg-green-200 dark:bg-green-800" />
              <div className="flex justify-between font-bold text-green-700 dark:text-green-400">
                <span>إجمالي الإيرادات</span>
                <span>{formatCurrency(data.totals.totalIncome)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 space-y-3">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <ArrowDownRight size={16} />
                المصاريف
              </h3>
              <div className="space-y-2 text-sm">
                {categories.map(cat => {
                  const catData = data.expensesByCategory[cat]
                  return (
                    <div key={cat} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{catData.label}</span>
                      <span className="font-medium">{formatCurrency(catData.total)}</span>
                    </div>
                  )
                })}
                {categories.length === 0 && (
                  <p className="text-muted-foreground text-center py-1">لا يوجد مصاريف</p>
                )}
              </div>
              <Separator className="bg-red-200 dark:bg-red-800" />
              <div className="flex justify-between font-bold text-red-700 dark:text-red-400">
                <span>إجمالي المصاريف</span>
                <span>{formatCurrency(data.totals.totalExpenses)}</span>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className={`p-5 rounded-lg border-2 ${data.totals.netProfit >= 0 ? 'bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800' : 'bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.totals.netProfit >= 0 ? 'bg-green-200 dark:bg-green-900' : 'bg-red-200 dark:bg-red-900'}`}>
                    {data.totals.netProfit >= 0 ? <TrendingUp size={24} className="text-green-600" /> : <TrendingDown size={24} className="text-red-600" />}
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${data.totals.netProfit >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {data.totals.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {MONTHS_AR[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </p>
                  </div>
                </div>
                <p className={`text-3xl font-bold ${data.totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.totals.netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(data.totals.netProfit))}
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">الطلاب الجدد</p>
                <p className="text-lg font-bold">{data.totals.newStudentsCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">تسجيلات جديدة</p>
                <p className="text-lg font-bold">{data.enrollments.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">حسابات ممولة جديدة</p>
                <p className="text-lg font-bold">{data.fundedSales.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/** Grouped expense category component */
function ExpenseCategoryGroup({
  label,
  items,
  total,
  formatCurrency,
  formatDate,
}: {
  category: string
  label: string
  items: any[]
  total: number
  formatCurrency: (v: number) => string
  formatDate: (v: string) => string
}) {
  return (
    <>
      {/* Category header row */}
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableCell colSpan={3} className="font-bold text-sm">
          <Badge variant="secondary" className="ml-2">{CATEGORY_LABELS[label.toLowerCase()] || label}</Badge>
          {label}
        </TableCell>
        <TableCell className="text-left font-bold text-sm">{formatCurrency(total)}</TableCell>
      </TableRow>
      {/* Individual expense rows */}
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="text-muted-foreground text-sm pr-10">—</TableCell>
          <TableCell className="text-sm">
            {item.description || '-'}
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">{formatDate(item.date)}</TableCell>
          <TableCell className="text-left text-sm text-red-500">{formatCurrency(item.amount)}</TableCell>
        </TableRow>
      ))}
    </>
  )
}
