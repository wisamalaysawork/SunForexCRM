'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccountingData, useExpenseMutations } from '@/hooks/accounting/use-accounting'
import {
  Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
  Receipt, Building2, Lightbulb, Users, Megaphone, Monitor,
  Wallet, GraduationCap, Handshake
} from 'lucide-react'

// ── Constants ──
const CATEGORIES = [
  { value: 'rent', label: 'إيجارات', emoji: '🏠', icon: Building2, color: 'text-orange-500 bg-orange-50' },
  { value: 'bills', label: 'فواتير (كهرباء/ماء)', emoji: '💡', icon: Lightbulb, color: 'text-yellow-500 bg-yellow-50' },
  { value: 'salaries', label: 'رواتب موظفين', emoji: '👥', icon: Users, color: 'text-blue-500 bg-blue-50' },
  { value: 'marketing', label: 'حملات إعلانية', emoji: '📢', icon: Megaphone, color: 'text-purple-500 bg-purple-50' },
  { value: 'software', label: 'برمجيات واستضافة', emoji: '💻', icon: Monitor, color: 'text-emerald-500 bg-emerald-50' },
  { value: 'other', label: 'مصروفات أخرى', emoji: '📋', icon: Receipt, color: 'text-gray-500 bg-gray-50' },
]

export default function AccountingComponent() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<any>(null)
  
  const [form, setForm] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // ── Queries and Mutations ──
  const { data, isLoading } = useAccountingData(currentMonth)
  const { createExpense, updateExpense, deleteExpense } = useExpenseMutations(currentMonth)

  // ── Derived Data ──
  const expenses = data?.expenses || []
  const payments = data?.payments || []
  const monthEnrollments = data?.monthEnrollments || []
  const monthFundedSales = data?.monthFundedSales || []
  const partnerIncomes = data?.partnerIncomes || []
  const debtPayments = data?.debtPayments || []

  // Income calculations
  const enrollmentIncome = monthEnrollments
    .filter((e: any) => e.paymentStatus === 'paid' || e.paymentStatus === 'partial')
    .reduce((sum: number, e: any) => sum + e.amountPaid, 0)

  const fundedIncome = monthFundedSales
    .filter((s: any) => s.paymentStatus === 'paid' || s.paymentStatus === 'partial')
    .reduce((sum: number, s: any) => sum + s.amountPaid, 0)

  const manualPaymentsTotal = payments.reduce((sum: number, p: any) => sum + p.amount, 0)
  const partnerTotal = partnerIncomes.reduce((sum: number, p: any) => sum + p.amount, 0)
  
  const totalIncome = manualPaymentsTotal + enrollmentIncome + fundedIncome + partnerTotal

  // Expenses calculations
  const manualExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
  const fundedCosts = monthFundedSales
    .filter((s: any) => s.paymentStatus !== 'cancelled')
    .reduce((sum: number, s: any) => sum + (s.accountType?.costPrice || 0), 0)
  
  const debtRepayments = debtPayments.reduce((sum: number, p: any) => sum + p.amount, 0)

  const totalExpenses = manualExpenses + fundedCosts + debtRepayments
  const netProfit = totalIncome - totalExpenses

  // Transaction history compilation
  const transactions = [
    // Income: Payments
    ...payments.map((p: any) => ({
      id: `pay-${p.id}`,
      type: 'income',
      category: 'payment',
      title: `دفعة من ${p.student?.name || 'طالب'}`,
      amount: p.amount,
      date: new Date(p.date),
      icon: Wallet,
      color: 'text-green-500'
    })),
    // Income: Enrollments
    ...monthEnrollments.filter((e: any) => e.amountPaid > 0).map((e: any) => ({
      id: `enr-${e.id}`,
      type: 'income',
      category: 'enrollment',
      title: `تسجيل دورة: ${e.course?.name || ''} - ${e.student?.name || ''}`,
      amount: e.amountPaid,
      date: new Date(e.createdAt),
      icon: GraduationCap,
      color: 'text-emerald-500'
    })),
    // Income: Funded Sales
    ...monthFundedSales.filter((s: any) => s.amountPaid > 0).map((s: any) => ({
      id: `fun-${s.id}`,
      type: 'income',
      category: 'funded',
      title: `شراء حساب ${s.accountType?.name || ''} - ${s.student?.name || ''}`,
      amount: s.amountPaid,
      date: new Date(s.soldAt),
      icon: TrendingUp,
      color: 'text-teal-500'
    })),
    // Income: Partners
    ...partnerIncomes.map((p: any) => ({
      id: `part-${p.id}`,
      type: 'income',
      category: 'partner',
      title: `عمولة من الشريك: ${p.partner?.name || 'غير معروف'}`,
      amount: p.amount,
      date: new Date(p.date),
      icon: Handshake,
      color: 'text-lime-500'
    })),
    // Expenses: Manual
    ...expenses.map((e: any) => {
      const cat = CATEGORIES.find(c => c.value === e.category)
      return {
        id: `exp-${e.id}`,
        type: 'expense',
        category: e.category,
        title: e.description || cat?.label || 'مصروف',
        amount: e.amount,
        date: new Date(e.date),
        icon: cat?.icon || Receipt,
        color: cat?.color?.split(' ')[0] || 'text-red-500'
      }
    }),
    // Expenses: Funded Costs
    ...monthFundedSales.filter((s: any) => s.paymentStatus !== 'cancelled' && s.accountType?.costPrice > 0).map((s: any) => ({
      id: `cost-${s.id}`,
      type: 'expense',
      category: 'funded_cost',
      title: `تكلفة مزود حساب ${s.accountType?.name || ''}`,
      amount: s.accountType.costPrice,
      date: new Date(s.soldAt),
      icon: DollarSign,
      color: 'text-pink-500'
    })),
    // Expenses: Debt Repayments
    ...debtPayments.map((p: any) => ({
      id: `debt-${p.id}`,
      type: 'expense',
      category: 'debt_payment',
      title: `سداد دين: ${p.debt?.source || 'قرض'}`,
      amount: p.amount,
      date: new Date(p.date),
      icon: Handshake,
      color: 'text-blue-500'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  // Categories Aggregation
  const categoryTotals: Record<string, { label: string, color: string, amount: number }> = {}
  expenses.forEach((e: any) => {
    const cat = CATEGORIES.find(c => c.value === e.category)
    if (!categoryTotals[e.category]) {
      categoryTotals[e.category] = {
        label: cat?.label || e.category,
        color: cat?.color || 'bg-gray-100 text-gray-500',
        amount: 0
      }
    }
    categoryTotals[e.category].amount += e.amount
  })
  if (fundedCosts > 0) {
    categoryTotals['funded_cost'] = {
      label: 'تكاليف حسابات ممولة',
      color: 'bg-pink-50 text-pink-500',
      amount: fundedCosts
    }
  }

  // ── Handlers ──
  const openNewExpenseDialog = () => {
    setEditExpense(null)
    setForm({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] })
    setDialogOpen(true)
  }

  const openEditExpenseDialog = (expense: any) => {
    setEditExpense(expense)
    setForm({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || '',
      date: new Date(expense.date).toISOString().split('T')[0]
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.category || !form.amount) return

    const data = {
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString()
    }

    if (editExpense) {
      updateExpense.mutate({ id: editExpense.id, ...data }, {
        onSuccess: () => setDialogOpen(false)
      })
    } else {
      createExpense.mutate(data, {
        onSuccess: () => setDialogOpen(false)
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      deleteExpense.mutate(id)
    }
  }

  const changeMonth = (offset: number) => {
    const [y, m] = currentMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + offset, 1)
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-32" /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المالية والمحاسبة</h1>
          <p className="text-muted-foreground mt-1">تتبع الواردات والمصروفات والأرباح</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}><ChevronRight className="h-5 w-5" /></Button>
          <div className="font-semibold px-4 min-w-[140px] text-center">
            {new Date(currentMonth + '-01').toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
          </div>
          <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50/30 border-emerald-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">إجمالي الواردات</p>
                <h3 className="text-3xl font-bold text-emerald-900">${totalIncome.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="bg-gradient-to-br from-rose-50 to-red-50/30 border-rose-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-rose-600 mb-1">المصاريف التشغيلية</p>
                <h3 className="text-3xl font-bold text-rose-900">${manualExpenses.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debt Repayments */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/30 border-blue-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">سداد ديون</p>
                <h3 className="text-3xl font-bold text-blue-900">${debtRepayments.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <Handshake className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net */}
        <Card className={netProfit >= 0 ? "bg-gradient-to-br from-emerald-50 to-emerald-100/30 border-emerald-200 shadow-sm" : "bg-gradient-to-br from-orange-50 to-red-50/30 border-orange-100 shadow-sm"}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-medium mb-1 ${netProfit >= 0 ? 'text-emerald-700' : 'text-orange-600'}`}>صافي الربح</p>
                <h3 className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
                  ${netProfit.toLocaleString()}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">سجل الحركات</TabsTrigger>
            <TabsTrigger value="expenses">المصروفات التفصيلية</TabsTrigger>
          </TabsList>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewExpenseDialog} className="gap-2">
                <Plus className="h-4 w-4" /> إضافة مصروف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>تاريخ المصروف</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر التصنيف..." /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <span className="flex items-center gap-2">{c.emoji} {c.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>المبلغ ($)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                
                <div className="space-y-2">
                  <Label>البيان / ملاحظات (اختياري)</Label>
                  <Textarea placeholder="تفاصيل المصروف..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                
                <Button className="w-full" onClick={handleSave} disabled={createExpense.isPending || updateExpense.isPending}>
                  {createExpense.isPending || updateExpense.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="overview" className="m-0">
          <Card>
            <CardHeader><CardTitle>الحركات المالية للشهر ({transactions.length})</CardTitle></CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">لا توجد حركات مسجلة هذا الشهر</div>
              ) : (
                <div className="space-y-4">
                  {transactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-opacity-10 ${t.type === 'income' ? 'bg-emerald-500 text-emerald-600' : 'bg-rose-500 text-rose-600'}`}>
                          <t.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{t.title}</p>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mt-1">
                            <span>{t.date.toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge variant="outline" className={`text-base px-3 py-1 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="m-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>البيان</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense: any) => {
                    const cat = CATEGORIES.find(c => c.value === expense.category)
                    return (
                      <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.date).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cat?.color || ''}>
                            {cat ? `${cat.emoji} ${cat.label}` : expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">{expense.description || '-'}</TableCell>
                        <TableCell className="font-medium font-mono">${expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => openEditExpenseDialog(expense)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(expense.id)} disabled={deleteExpense.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {expenses.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد مصروفات يدوية مسجلة</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
