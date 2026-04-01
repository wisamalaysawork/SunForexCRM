'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigation } from '@/components/shared/navigation-context'
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  UserPlus,
  Receipt,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────
interface DashboardData {
  students: { total: number; active: number; inactive: number }
  courses: { total: number; active: number; enrollments: number; paidEnrollments: number; pendingEnrollments: number }
  fundedAccounts: { totalSales: number; paidSales: number; totalProfit: number; accountTypes: any[] }
  income: { fromCourses: number; fromFunded: number; totalPayments: number; monthlyPayments: number }
  financials: {
    income: {
      payments: number
      enrollments: number
      fundedSales: number
      partners: number
      total: number
    }
    expenses: {
      total: number
      byCategory: Array<{ category: string; _sum: { amount: number }; _count: number }>
    }
    profit: number
  }
  enrollments?: { total: number }
  recentStudents?: any[]
  recentFundedSales?: any[]
}

interface MonthlyBarData {
  name: string
  income: number
  expenses: number
}

// ─── Constants ───────────────────────────────────────────────────────
const categoryLabels: Record<string, string> = {
  rent: 'إيجارات',
  bills: 'فواتير',
  salaries: 'رواتب',
  marketing: 'تسويق',
  software: 'برمجيات',
  other: 'أخرى',
  funded_cost: 'تكاليف حسابات ممولة',
}

const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

const PIE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#6b7280']
const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#ef4444'

// ─── Helpers ─────────────────────────────────────────────────────────
function getMonthString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getLast6Months(): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(getMonthString(d))
  }
  return months
}

function formatMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number)
  return `${arabicMonths[month - 1]} ${year}`
}

function getArabicMonthShort(monthStr: string): string {
  const month = parseInt(monthStr.split('-')[1], 10)
  return arabicMonths[month - 1]
}

// ─── Custom Tooltip for Bar Chart ────────────────────────────────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm" dir="rtl">
      <p className="font-bold mb-2">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name === 'الدخل' ? 'الدخل' : 'المصاريف'}:</span>
            <span className="font-bold">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Custom Tooltip for Pie Chart ────────────────────────────────────
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0]
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm" dir="rtl">
      <p className="font-bold">{data.name}</p>
      <p className="text-muted-foreground">${data.value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{data.payload.percent}%</p>
    </div>
  )
}

// ─── Custom Pie Label ────────────────────────────────────────────────
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ─── Skeleton Loader ─────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────
export function Dashboard() {
  const { setCurrentPage, setSelectedStudentId, refreshKey } = useNavigation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [barData, setBarData] = useState<MonthlyBarData[]>([])
  const [mainReady, setMainReady] = useState(-1)
  const [chartsReady, setChartsReady] = useState(-1)

  const isLoading = mainReady !== refreshKey || chartsReady !== refreshKey

  // Fetch main dashboard data (current month)
  useEffect(() => {
    const key = refreshKey
    const currentMonth = getMonthString(new Date())
    fetch(`/api/dashboard?month=${currentMonth}`)
      .then(res => res.json())
      .then(d => {
        setData(d)
        setMainReady(key)
      })
      .catch(() => setMainReady(key))
  }, [refreshKey])

  // Fetch bar chart data for last 6 months
  useEffect(() => {
    const months = getLast6Months()
    const key = refreshKey

    Promise.all(
      months.map(month =>
        fetch(`/api/dashboard?month=${month}`).then(res => res.json())
      )
    )
      .then(results => {
        const chartData: MonthlyBarData[] = results.map((d, idx) => ({
          name: getArabicMonthShort(months[idx]),
          income: d.financials?.income?.total || 0,
          expenses: d.financials?.expenses?.total || 0,
        }))
        setBarData(chartData)
        setChartsReady(key)
      })
      .catch(() => setChartsReady(key))
  }, [refreshKey])

  const loading = isLoading
  if (loading) return <DashboardSkeleton />
  if (!data) return <div className="text-center text-muted-foreground py-12">فشل في تحميل البيانات</div>

  const isPositive = data.financials.profit >= 0

  // Pie chart data for expense categories
  const rawByCategory = data?.financials?.expenses?.byCategory || [];
  let totalCatExpenses = 0;
  
  const categoryMap: Record<string, number> = {};
  rawByCategory.forEach((catInfo: any) => {
    const amount = catInfo._sum?.amount || 0;
    categoryMap[catInfo.category] = amount;
    totalCatExpenses += amount;
  });

  const pieData = Object.entries(categoryMap)
    .filter(([, val]) => val > 0)
    .map(([key, val]) => ({
      name: categoryLabels[key] || key,
      value: Math.round(val),
      percent: data.financials.expenses.total > 0 ? ((val / data.financials.expenses.total) * 100).toFixed(1) : '0',
    }))

  // Quick action buttons
  const quickActions = [
    { label: 'إضافة طالب', icon: UserPlus, page: 'students' as const, variant: 'default' as const },
    { label: 'إضافة مصروف', icon: Receipt, page: 'accounting' as const, variant: 'outline' as const },
    { label: 'عرض جميع الطلاب', icon: Eye, page: 'students' as const, variant: 'outline' as const },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">لوحة التحكم</h2>
          <p className="text-muted-foreground">نظرة عامة على أداء المكتب</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full w-fit">
          <span className="text-sm font-semibold">إحصائيات شهر {formatMonthLabel(getMonthString(new Date()))}</span>
        </div>
      </div>

      {/* ── Top Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Students */}
        <Card
          className="cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group rounded-2xl border-border/50 bg-card/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDelay: '100ms' }}
          onClick={() => setCurrentPage('students')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي الطلاب</p>
                <p className="text-3xl font-bold tracking-tight">{data.students.total}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-xs text-green-600 font-medium">{data.students.active} فعال</p>
                  <span className="text-xs text-muted-foreground">• {data.students.inactive} غير فعال</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 transition-colors">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Income */}
        <Card
          className="cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group rounded-2xl border-border/50 bg-card/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDelay: '200ms' }}
          onClick={() => setCurrentPage('accounting')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي الواردات</p>
                <p className="text-3xl font-bold tracking-tight text-emerald-600">${data.financials.income.total.toFixed(0)}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowUpRight size={12} className="text-emerald-600" />
                  <p className="text-xs text-muted-foreground font-medium">الواردات الكلية لهذا الشهر</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 transition-colors">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funded Accounts */}
        <Card
          className="cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group rounded-2xl border-border/50 bg-card/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDelay: '300ms' }}
          onClick={() => setCurrentPage('funded')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">حسابات ممولة</p>
                <p className="text-3xl font-bold tracking-tight">{data.fundedAccounts.totalSales}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowUpRight size={12} className="text-green-600" />
                  <p className="text-xs text-green-600 font-medium">ربح ${(data.financials.income.fundedSales).toFixed(0)}</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 transition-colors">
                <Wallet className="text-emerald-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Net */}
        <Card
          className="cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group rounded-2xl border-border/50 bg-card/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDelay: '400ms' }}
          onClick={() => setCurrentPage('accounting')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">صافي الشهر</p>
                <p className={`text-3xl font-bold tracking-tight ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(data.financials.profit).toFixed(0)}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {isPositive ? (
                    <ArrowUpRight size={12} className="text-green-600" />
                  ) : (
                    <ArrowDownRight size={12} className="text-red-600" />
                  )}
                  <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? 'ربح صافي' : 'خسارة صافية'}
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-2xl group-hover:opacity-80 transition-colors ${
                isPositive
                  ? 'bg-green-50 dark:bg-green-950/60'
                  : 'bg-red-50 dark:bg-red-950/60'
              }`}>
                <TrendingUp
                  className={isPositive ? 'text-green-600' : 'text-red-600'}
                  size={24}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Income vs Expenses */}
        <Card className="lg:col-span-2 rounded-2xl border-border/50 shadow-lg bg-card/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-muted-foreground" />
              <CardTitle className="text-base">الدخل مقابل المصاريف</CardTitle>
            </div>
            <CardDescription>مقارنة شهرية للآخر ٦ أشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar
                    dataKey="income"
                    name="الدخل"
                    fill={INCOME_COLOR}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expenses"
                    name="المصاريف"
                    fill={EXPENSE_COLOR}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: INCOME_COLOR }} />
                <span className="text-sm text-muted-foreground">الدخل</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: EXPENSE_COLOR }} />
                <span className="text-sm text-muted-foreground">المصاريف</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Expense Breakdown */}
        <Card className="rounded-2xl border-border/50 shadow-lg bg-card/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon size={18} className="text-muted-foreground" />
              <CardTitle className="text-base">توزيع المصاريف</CardTitle>
            </div>
            <CardDescription>حسب الفئة - الشهر الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">لا توجد مصاريف هذا الشهر</p>
              </div>
            ) : (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Category Legend */}
                <div className="mt-2 space-y-2 max-h-28 overflow-y-auto">
                  {pieData.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-medium">${entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <Card className="rounded-2xl border-border/50 shadow-lg bg-card/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '700ms' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  variant={action.variant}
                  className="gap-2 h-10"
                  onClick={() => setCurrentPage(action.page)}
                >
                  <Icon size={16} />
                  {action.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Financial Summary Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Payments */}
        <Card className="hover:shadow-xl transition-shadow rounded-2xl border-border/50 bg-card/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '800ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign size={16} /> إجمالي المدفوعات الواردة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${data.financials.income.total.toFixed(0)}</p>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <p>الدورات: ${data.financials.income.enrollments.toFixed(0)}</p>
              <p>الحسابات الممولة: ${data.financials.income.fundedSales.toFixed(0)}</p>
              <p>شراكات/عمولات إضافية: ${data.financials.income.partners.toFixed(0)}</p>
              {data.financials.income.payments > 0 && <p>مدفوعات متنوعة: ${data.financials.income.payments.toFixed(0)}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="hover:shadow-xl transition-shadow rounded-2xl border-border/50 bg-card/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '900ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownRight size={16} className="text-red-500" /> إجمالي المصاريف (الشهر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${data.financials.expenses.total.toFixed(0)}</p>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              {pieData.map((d: any) => (
                <p key={d.name}>{d.name}: ${d.value}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funded Profit */}
        <Card className="hover:shadow-xl transition-shadow rounded-2xl border-border/50 bg-card/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '1000ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} /> ربح الحسابات الممولة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(data.financials.income.fundedSales).toFixed(0)}</p>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <p>{data.fundedAccounts.paidSales} حساب مدفوع من {data.fundedAccounts.totalSales}</p>
              {(data.fundedAccounts?.accountTypes || []).map((at: any) => (
                <p key={at.id}>{at.name}: {at._count.sales} مبيعات (ربح الوحدة: ${(at.sellingPrice - at.costPrice).toFixed(0)})</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Data ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Students */}
        <Card className="hover:shadow-xl transition-shadow rounded-2xl border-border/50 bg-card/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '1100ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">آخر الطلاب المسجلين</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setCurrentPage('students')}
              >
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!(data.recentStudents?.length) ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا يوجد طلاب بعد</p>
            ) : (
              <div className="space-y-1">
                {(data.recentStudents || []).map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/80 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedStudentId(s.id)
                      setCurrentPage('student-detail')
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-sm font-bold border border-primary/10">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.phone || s.email || '-'}</p>
                      </div>
                    </div>
                    <Badge
                      variant={s.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {s.status === 'active' ? 'فعال' : 'غير فعال'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Funded Sales */}
        <Card className="hover:shadow-xl transition-shadow rounded-2xl border-border/50 bg-card/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '1200ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">آخر مبيعات الحسابات الممولة</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setCurrentPage('funded')}
              >
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!(data.recentFundedSales?.length) ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا يوجد مبيعات بعد</p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {data.recentFundedSales.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                        <Wallet size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{s.student?.name}</p>
                        <p className="text-xs text-muted-foreground">{s.accountType?.name}</p>
                      </div>
                    </div>
                    <div className="text-left flex items-center gap-3">
                      <div>
                        <p className="text-sm font-bold">${s.amountPaid}</p>
                        <Badge
                          variant={
                            s.paymentStatus === 'paid'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {s.paymentStatus === 'paid'
                            ? 'مدفوع'
                            : s.paymentStatus === 'pending'
                              ? 'معلق'
                              : 'جزئي'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
