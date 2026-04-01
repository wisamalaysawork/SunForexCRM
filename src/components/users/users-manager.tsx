"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { UserCog, Plus, ShieldCheck, HelpCircle, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"

type User = {
  id: string
  username: string
  canManageStudents: boolean
  canManageCourses: boolean
  canManageFunded: boolean
  canManageAccounting: boolean
  canManagePartners: boolean
  canManageDebts: boolean
  canManageUsers: boolean
}

export function UsersManager() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{id: string, username: string} | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    canManageStudents: true,
    canManageCourses: true,
    canManageFunded: true,
    canManageAccounting: true,
    canManagePartners: true,
    canManageDebts: true,
    canManageUsers: false,
  })

  // Check if current user has permission
  const canManageUsers = session?.user?.permissions?.canManageUsers

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers()
    }
  }, [canManageUsers])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        toast.error("فشل في جلب المستخدمين")
      }
    } catch (error) {
      toast.error("حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.username) {
        toast.error("يجب إدخال اسم المستخدم")
        return
      }

      const method = formData.id ? "PUT" : "POST"
      const url = formData.id ? `/api/users/${formData.id}` : "/api/users"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(formData.id ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح")
        setIsDialogOpen(false)
        fetchUsers()
      } else {
        const err = await res.json()
        toast.error(err.error || "حدث خطأ أثناء الحفظ")
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ")
    }
  }

  const openNewDialog = () => {
    setFormData({
      id: "",
      username: "",
      password: "",
      canManageStudents: true,
      canManageCourses: true,
      canManageFunded: true,
      canManageAccounting: true,
      canManagePartners: true,
      canManageDebts: true,
      canManageUsers: false,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setFormData({
      ...user,
      password: "", // Don't fetch password, only to update
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string, username: string) => {
    setUserToDelete({ id, username })
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, { method: "DELETE" })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userToDelete.id))
        toast.success("تم حذف المستخدم")
        setDeleteConfirmOpen(false)
        setUserToDelete(null)
      } else {
        toast.error("فشل في حذف المستخدم")
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف")
    }
  }

  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground animate-in fade-in zoom-in duration-500">
         <ShieldCheck size={64} className="mb-4 text-primary/50" />
         <h2 className="text-2xl font-bold text-foreground">لا تملك صلاحية الوصول</h2>
         <p className="mt-2">قم بالتواصل مع الإدارة للحصول على صلاحيات المديرين.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <UserCog className="text-primary" />
            إدارة المستخدمين
          </h2>
          <p className="text-muted-foreground mt-1">
            إضافة وتعديل المديرين وصلاحيات الوصول للنظام.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
              <Plus size={16} />
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>{formData.id ? "تعديل مستخدم" : "مستخدم جديد"}</DialogTitle>
              <DialogDescription>
                {formData.id ? "قم بتعديل بيانات المدير وصلاحياته هنا." : "أدخل بيانات المدير الجديد وحدد صلاحياته."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user-username">اسم المستخدم</Label>
                <Input
                  id="user-username"
                  name="username"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  dir="ltr"
                  className="text-right"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-password">{formData.id ? "كلمة المرور الجديدة (اختياري)" : "كلمة المرور"}</Label>
                <Input
                  id="user-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  dir="ltr"
                  placeholder={formData.id ? "اتركه فارغاً للاحتفاظ بكلمة المرور الحالية" : "••••••••"}
                />
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-4 text-sm text-foreground/80 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  صلاحيات المستخدم
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="p-students">إدارة الطلاب والتسجيلات</Label>
                    <Switch id="p-students" checked={formData.canManageStudents} onCheckedChange={(c) => setFormData({...formData, canManageStudents: c})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="p-courses">إدارة الدورات</Label>
                    <Switch id="p-courses" checked={formData.canManageCourses} onCheckedChange={(c) => setFormData({...formData, canManageCourses: c})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="p-funded">إدارة الحسابات الممولة</Label>
                    <Switch id="p-funded" checked={formData.canManageFunded} onCheckedChange={(c) => setFormData({...formData, canManageFunded: c})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="p-accounting">المحاسبة والتقارير المالية</Label>
                    <Switch id="p-accounting" checked={formData.canManageAccounting} onCheckedChange={(c) => setFormData({...formData, canManageAccounting: c})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="p-partners">إدارة الشركاء الإضافيين (العمولات)</Label>
                    <Switch id="p-partners" checked={formData.canManagePartners} onCheckedChange={(c) => setFormData({...formData, canManagePartners: c})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="p-debts">إدارة الديون وسدادها</Label>
                    <Switch id="p-debts" checked={formData.canManageDebts} onCheckedChange={(c) => setFormData({...formData, canManageDebts: c})} />
                  </div>
                  <div className="flex items-center justify-between bg-primary/10 p-3 rounded-xl border border-primary/20">
                    <Label className="cursor-pointer font-bold text-primary" htmlFor="p-users">صلاحيات المدير العام (سوبر أدمن)</Label>
                    <Switch id="p-users" checked={formData.canManageUsers} onCheckedChange={(c) => setFormData({...formData, canManageUsers: c})} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave}>حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-xl bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">اسم المستخدم</TableHead>
              <TableHead className="text-right">الصلاحيات</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">لا يوجد مستخدمين آخرين.</TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium font-mono text-lg">{user.username}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.canManageUsers && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-bold">سوبر أدمن</span>}
                      {user.canManageStudents && <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">الطلاب</span>}
                      {user.canManageCourses && <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">الدورات</span>}
                      {user.canManageFunded && <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">الممولة</span>}
                      {user.canManageAccounting && <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">المحاسبة</span>}
                      {user.canManagePartners && <span className="text-xs bg-lime-500/10 text-lime-600 dark:text-lime-400 px-2 py-1 rounded-full">الشركاء</span>}
                      {user.canManageDebts && <span className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">الديون</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>تعديل</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id, user.username)}>حذف</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المستخدم &quot;{userToDelete?.username}&quot;؟ لا يمكن التراجع عن هذا الإجراء وسيتم سحب جميع صلاحيات الوصول الخاصة به فوراً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">تأكيد الحذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
