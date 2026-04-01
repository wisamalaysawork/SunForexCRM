'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDebts } from '@/hooks/debts/use-debts'
import { Plus, Wallet, Handshake, Calendar, History, Trash2, CheckCircle2, AlertCircle, TrendingUp, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DebtsManager() {
  const { debts, isLoading, createDebt, updateDebt, deleteDebt, addPayment } = useDebts()
  const [debtDialogOpen, setDebtDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<any>(null)
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const [debtForm, setDebtForm] = useState({
    amount: '',
    source: '',
    description: '',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0]
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Calculations
  const activeDebts = debts.filter((d: any) => d.status === 'active')
  const totalDebtAmount = debts.reduce((sum: number, d: any) => sum + d.amount, 0)
  const totalPaidAmount = debts.reduce((sum: number, d: any) => {
    const paid = d.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0
    return sum + paid
  }, 0)
  const remainingAmount = totalDebtAmount - totalPaidAmount

  const handleCreateOrUpdateDebt = async () => {
    if (!debtForm.amount || !debtForm.source) return
    try {
      if (selectedDebt && debtDialogOpen) {
        // We are in Edit mode
        await updateDebt({ id: selectedDebt.id, ...debtForm })
        toast({ title: "تم تحديث الدين بنجاح" })
      } else {
        // We are in Create mode
        await createDebt(debtForm)
        toast({ title: "تمت إضافة الدين بنجاح" })
      }
      setDebtDialogOpen(false)
      setSelectedDebt(null)
      setDebtForm({ amount: '', source: '', description: '', status: 'active', startDate: new Date().toISOString().split('T')[0] })
    } catch (e) {
      toast({ title: "خطأ في العملية", variant: "destructive" })
    }
  }

  const openEditDebt = (debt: any) => {
    setSelectedDebt(debt)
    setDebtForm({
      amount: debt.amount.toString(),
      source: debt.source,
      description: debt.description || '',
      status: debt.status,
      startDate: new Date(debt.startDate).toISOString().split('T')[0]
    })
    setDebtDialogOpen(true)
  }

  const handleAddPayment = async () => {
    if (!paymentForm.amount || !selectedDebt) return
    try {
      await addPayment({ debtId: selectedDebt.id, ...paymentForm })
      setPaymentDialogOpen(false)
      setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
      toast({ title: "تم تسجيل الدفعة بنجاح" })
    } catch (e) {
      toast({ title: "خطأ في تسجيل الدفعة", variant: "destructive" })
    }
  }

  const handleDeleteDebt = async () => {
    if (!debtToDelete) return
    try {
      await deleteDebt(debtToDelete)
      setDeleteDialogOpen(false)
      setDebtToDelete(null)
      toast({ title: "تم حذف الدين بنجاح" })
    } catch (e) {
      toast({ title: "خطأ في حذف الدين", variant: "destructive" })
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الديون</h1>
          <p className="text-muted-foreground mt-1">تتبع القروض والديون المستحقة وجدولة السداد</p>
        </div>

        <Dialog open={debtDialogOpen} onOpenChange={(open) => {
          setDebtDialogOpen(open)
          if (!open) { setSelectedDebt(null); setDebtForm({ amount: '', source: '', description: '', status: 'active', startDate: new Date().toISOString().split('T')[0] }) }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => {
              setSelectedDebt(null)
              setDebtForm({ amount: '', source: '', description: '', status: 'active', startDate: new Date().toISOString().split('T')[0] })
            }}>
              <Plus size={18} /> إضافة دين جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedDebt ? 'تعديل بيانات الدين' : 'إضافة دين جديد'}</DialogTitle>
              <DialogDescription>أدخل تفاصيل الدين لتتبعه في النظام</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="debt-source">جهة الدين (المقرض)</Label>
                <Input 
                  id="debt-source"
                  name="source"
                  placeholder="مثال: البنك العربي، فلان الفلاني..." 
                  value={debtForm.source}
                  onChange={e => setDebtForm({ ...debtForm, source: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debt-amount">المبلغ الكلي ($)</Label>
                  <Input 
                    id="debt-amount"
                    name="amount"
                    type="number" 
                    placeholder="0.00" 
                    value={debtForm.amount}
                    onChange={e => setDebtForm({ ...debtForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt-start-date">تاريخ أخذ الدين</Label>
                  <Input 
                    id="debt-start-date"
                    name="startDate"
                    type="date" 
                    value={debtForm.startDate}
                    onChange={e => setDebtForm({ ...debtForm, startDate: e.target.value })}
                  />
                </div>
              </div>

              {selectedDebt && (
                <div className="space-y-2">
                  <Label htmlFor="debt-status">حالة الدين</Label>
                  <Select value={debtForm.status} onValueChange={v => setDebtForm({ ...debtForm, status: v })}>
                    <SelectTrigger id="debt-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">قيد السداد (نشط)</SelectItem>
                      <SelectItem value="paid">تم التسديد بالكامل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="debt-description">ملاحظات إضافية</Label>
                <Textarea 
                  id="debt-description"
                  name="description"
                  placeholder="تفاصيل عن القرض أو شروط السداد..." 
                  value={debtForm.description}
                  onChange={e => setDebtForm({ ...debtForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={handleCreateOrUpdateDebt}>
                {selectedDebt ? 'تحديث البيانات' : 'حفظ الدين'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">إجمالي الديون</p>
                <h3 className="text-3xl font-bold text-blue-900">${totalDebtAmount.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">إجمالي المسدد</p>
                <h3 className="text-3xl font-bold text-emerald-900">${totalPaidAmount.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">المتبقي للدفع</p>
                <h3 className="text-3xl font-bold text-orange-900">${remainingAmount.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debts List */}
      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <History className="text-blue-600" size={20} /> سجل الديون والنشاط
        </h2>
        
        {debts.length === 0 ? (
          <Card className="border-dashed py-12 text-center text-muted-foreground">
            لا توجد ديون مسجلة حالياً
          </Card>
        ) : (
          debts.map((debt: any) => {
            const paid = debt.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0
            const remaining = debt.amount - paid
            const percent = (paid / debt.amount) * 100

            return (
              <Card key={debt.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-2xl ${debt.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Handshake size={24} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{debt.source}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar size={14} /> أخذ بتاريخ {new Date(debt.startDate).toLocaleDateString('ar-SA')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={debt.status === 'paid' ? 'secondary' : 'outline'} className={debt.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-blue-700 border-blue-200'}>
                        {debt.status === 'active' ? 'قيد السداد' : 'تم التسديد بالكامل'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditDebt(debt)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { setDebtToDelete(debt.id); setDeleteDialogOpen(true); }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">تقدم السداد ({percent.toFixed(0)}%)</span>
                      <span className="text-muted-foreground">${paid.toLocaleString()} / ${debt.amount.toLocaleString()}</span>
                    </div>
                    <Progress value={percent} className="h-2 bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Info */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-widest">التفاصيل</Label>
                        <p className="mt-1 text-sm">{debt.description || "لا توجد تفاصيل إضافية"}</p>
                      </div>
                      
                      {debt.status === 'active' && (
                        <Button 
                          onClick={() => { setSelectedDebt(debt); setPaymentDialogOpen(true); }}
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <TrendingUp size={18} /> تسجيل دفعة جديدة
                        </Button>
                      )}
                    </div>

                    {/* Right: Payments List */}
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground uppercase tracking-widest">آخر الدفعات</Label>
                      {debt.payments && debt.payments.length > 0 ? (
                        <div className="border rounded-xl overflow-hidden">
                          <Table>
                            <TableBody>
                              {debt.payments.map((p: any) => (
                                <TableRow key={p.id} className="text-xs">
                                  <TableCell className="font-medium text-emerald-600">+ ${p.amount.toLocaleString()}</TableCell>
                                  <TableCell>{new Date(p.date).toLocaleDateString('ar-SA')}</TableCell>
                                  <TableCell className="text-muted-foreground truncate max-w-[100px]">{p.notes}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-xl text-center">لم يتم تسجيل أي دفعات بعد</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة سداد</DialogTitle>
            <DialogDescription>سجل مبالغ الدفعات لإتمام عملية سداد الدين</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="debt-payment-amount">المبلغ المسدد ($)</Label>
              <Input 
                id="debt-payment-amount"
                name="amount"
                type="number" 
                placeholder="0.00" 
                value={paymentForm.amount}
                onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-payment-date">تاريخ الدفع</Label>
              <Input 
                id="debt-payment-date"
                name="date"
                type="date" 
                value={paymentForm.date}
                onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-payment-notes">ملاحظات (اختياري)</Label>
              <Input 
                id="debt-payment-notes"
                name="notes"
                placeholder="رقم الحوالة، اسم طريقة الدفع..." 
                value={paymentForm.notes}
                onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAddPayment}>تأكيد الدفع</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الدين</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الدين؟ سيتم حذف جميع بيانات الدين وسجل الدفعات المرتبطة به نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => setDebtToDelete(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDebt} className="bg-red-600 hover:bg-red-700">
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
