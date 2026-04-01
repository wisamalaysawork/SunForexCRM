"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Handshake, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function PartnersManager() {
  const { data: session } = useSession()
  const canManagePartners = session?.user?.permissions?.canManagePartners

  const [partners, setPartners] = useState<any[]>([])
  const [incomes, setIncomes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false)
  const [partnerForm, setPartnerForm] = useState({ name: "", description: "" })

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [incomeForm, setIncomeForm] = useState({
    partnerId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    month: new Date().toISOString().slice(0, 7)
  })

  useEffect(() => {
    if (canManagePartners) {
      fetchData()
    }
  }, [canManagePartners])

  const fetchData = async () => {
    setLoading(true)
    try {
      const pRes = await fetch("/api/partners")
      if (pRes.ok) setPartners(await pRes.json())

      const iRes = await fetch("/api/partner-incomes")
      if (iRes.ok) setIncomes(await iRes.json())
    } catch (err) {
      toast.error("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleAddPartner = async () => {
    if (!partnerForm.name) return toast.error("أدخل اسم الشريك")
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partnerForm)
      })
      if (res.ok) {
        toast.success("تمت إضافة الشريك")
        setIsPartnerDialogOpen(false)
        fetchData()
      } else toast.error("فشل الإضافة")
    } catch (err) {
      toast.error("خطأ بالشبكة")
    }
  }

  const handleDeletePartner = async (id: string) => {
    if (!confirm("حذف الشريك سيحذف جميع إيراداته. هل أنت متأكد؟")) return
    try {
      const res = await fetch(`/api/partners/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("تم الحذف")
        fetchData()
      }
    } catch (err) { /* error is handled */ }
  }

  const handleAddIncome = async () => {
    if (!incomeForm.partnerId || !incomeForm.amount) return toast.error("أدخل الشريك والمبلغ")
    try {
      const res = await fetch("/api/partner-incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incomeForm)
      })
      if (res.ok) {
        toast.success("تم تسجيل العمولة بنجاح")
        setIsIncomeDialogOpen(false)
        fetchData()
      } else toast.error("فشل التسجيل")
    } catch (err) {
      toast.error("خطأ بالشبكة")
    }
  }

  const handleDeleteIncome = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه العمولة؟")) return
    try {
      const res = await fetch(`/api/partner-incomes/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("تم حذف العمولة")
        fetchData()
      }
    } catch (err) { /* error is handled */ }
  }

  if (!canManagePartners) {
    return <div className="p-8 text-center text-red-500 font-bold">غير مصرح لك</div>
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Handshake className="text-primary" />
            الشركاء والعمولات الإضافية
          </h2>
          <p className="text-muted-foreground mt-1">تتبع الأرباح من شركات التمويل والشركاء الآخرين.</p>
        </div>
        
        <div className="flex gap-2">
          {/* Add Partner Dialog */}
          <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Handshake size={16} /> شركاء جدد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader><DialogTitle>إضافة شريك جديد</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>اسم الشريك (FundedNext, الخ)</Label>
                  <Input value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>وصف أو ملاحظات</Label>
                  <Input value={partnerForm.description} onChange={e => setPartnerForm({...partnerForm, description: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPartnerDialogOpen(false)}>إلغاء</Button>
                <Button onClick={handleAddPartner}>إضافة</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Income Dialog */}
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
                <Plus size={16} /> تسجيل عمولة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader><DialogTitle>تسجيل عمولة أو ربح جديد</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>تحديد الشريك</Label>
                  <Select value={incomeForm.partnerId} onValueChange={v => setIncomeForm({...incomeForm, partnerId: v})}>
                    <SelectTrigger><SelectValue placeholder="اختر الشريك" /></SelectTrigger>
                    <SelectContent dir="rtl">
                      {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المبلغ ($)</Label>
                  <Input type="number" dir="ltr" className="text-right" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تاريخ الدفع</Label>
                    <Input type="date" value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>شهر الاستحقاق</Label>
                    <Input type="month" value={incomeForm.month} onChange={e => setIncomeForm({...incomeForm, month: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات (اختياري)</Label>
                  <Input value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>إلغاء</Button>
                <Button onClick={handleAddIncome}>حفظ ومتابعة</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Incomes Table */}
        <Card className="lg:col-span-2 border-border/50 shadow-xl bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle>سجل العمولات الأخير</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الشريك</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">جاري التحميل...</TableCell></TableRow>
                ) : incomes.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">لم يتم تسجيل أي عمولات بعد.</TableCell></TableRow>
                ) : (
                  incomes.map(inc => (
                    <TableRow key={inc.id}>
                      <TableCell>{new Date(inc.date).toLocaleDateString("ar-EG")}</TableCell>
                      <TableCell className="font-bold">{inc.partner?.name}</TableCell>
                      <TableCell className="text-emerald-500 font-bold">${inc.amount}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(inc.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Partners List */}
        <Card className="border-border/50 shadow-xl bg-card/60 backdrop-blur-xl rounded-2xl">
          <CardHeader>
            <CardTitle>الشركاء المقيدين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {partners.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border/50">
                <div>
                  <h4 className="font-bold">{p.name}</h4>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeletePartner(p.id)} className="text-red-500">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {partners.length === 0 && !loading && <div className="text-sm text-center text-muted-foreground p-4">لا يوجد أي شركاء مضافين حالياً.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
