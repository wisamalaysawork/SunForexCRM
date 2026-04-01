'use client'

import { useNavigation } from '@/components/shared/navigation-context'
import { LayoutDashboard, Users, GraduationCap, Wallet, Calculator, FileText, Menu, X, Trash2, RotateCcw, LogOut, ShieldAlert, Handshake } from 'lucide-react'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export function Sidebar() {
  const { currentPage, setCurrentPage, triggerRefresh } = useNavigation()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  const permissions = session?.user?.permissions

  const navItems = [
    { id: 'dashboard' as const, label: 'لوحة التحكم', icon: LayoutDashboard, show: true },
    { id: 'students' as const, label: 'الطلاب', icon: Users, show: permissions?.canManageStudents !== false },
    { id: 'courses' as const, label: 'الدورات', icon: GraduationCap, show: permissions?.canManageCourses !== false },
    { id: 'funded' as const, label: 'الحسابات الممولة', icon: Wallet, show: permissions?.canManageFunded !== false },
    { id: 'partners' as const, label: 'الشركاء', icon: Handshake, show: permissions?.canManagePartners !== false },
    { id: 'accounting' as const, label: 'المحاسبة', icon: Calculator, show: permissions?.canManageAccounting !== false },
    { id: 'reports' as const, label: 'التقارير الشهرية', icon: FileText, show: permissions?.canManageAccounting !== false },
    { id: 'users' as const, label: 'المديرين', icon: ShieldAlert, show: permissions?.canManageUsers === true },
  ].filter(item => item.show)

  const handleReset = async () => {
    setResetting(true)
    try {
      const res = await fetch('/api/reset', { method: 'POST' })
      if (res.ok) {
        toast.success('تم مسح جميع البيانات بنجاح')
        setCurrentPage('dashboard')
        triggerRefresh()
      } else {
        toast.error('فشل في مسح البيانات')
      }
    } catch {
      toast.error('حدث خطأ أثناء مسح البيانات')
    }
    setResetting(false)
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg lg:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-card/80 backdrop-blur-2xl border-l border-border/50 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Theme */}
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">📈 SunForex</h1>
              <p className="text-xs text-muted-foreground mt-1">نظام المحاسبة و إدارة الطلاب</p>
            </div>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id)
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground hover:scale-[1.02] hover:shadow-sm'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-3">
            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              <span className="text-xs font-semibold">تسجيل الخروج</span>
            </Button>

            {permissions?.canManageUsers && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 dark:border-red-900/50 dark:hover:bg-red-950"
                    onClick={() => setMobileOpen(false)}
                  >
                    <RotateCcw size={16} />
                    <span className="text-xs">مسح جميع البيانات</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 size={20} />
                    مسح جميع البيانات
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="text-right leading-relaxed">
                      <p>هل أنت متأكد تماماً؟ سيتم حذف <strong>جميع</strong> البيانات بشكل نهائي:</p>
                      <ul className="mt-2 mr-4 space-y-1 text-sm list-disc text-muted-foreground">
                        <li>جميع الطلاب وتفاصيلهم</li>
                        <li>جميع الدورات والتسجيلات</li>
                        <li>جميع الحسابات الممولة ومبيعاتها</li>
                        <li>جميع المصاريف والمدفوعات</li>
                      </ul>
                      <p className="mt-3 text-red-600 font-medium">
                        ⚠️ هذا الإجراء لا يمكن التراجع عنه!
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel className="mt-0 sm:mt-0">إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    disabled={resetting}
                    className="bg-red-600 hover:bg-red-700 text-white mt-0 sm:mt-0"
                  >
                    {resetting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري المسح...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Trash2 size={16} />
                        نعم، امسح الكل
                      </span>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            )}

            <p className="text-xs text-muted-foreground text-center">
              SunForex ©
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
