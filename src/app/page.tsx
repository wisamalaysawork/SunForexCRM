'use client'

import { NavigationProvider, useNavigation } from '@/components/shared/navigation-context'
import { Sidebar } from '@/components/shared/sidebar'
import { Dashboard } from '@/components/dashboard/dashboard'
import { StudentsList } from '@/components/students/students-list'
import { StudentDetail } from '@/components/students/student-detail'
import { CoursesManager } from '@/components/courses/courses-manager'
import { FundedAccountsManager } from '@/components/funded/funded-accounts'
import Accounting from '@/components/accounting/accounting'
import { MonthlyReport } from '@/components/reports/monthly-report'
import { UsersManager } from '@/components/users/users-manager'
import { PartnersManager } from '@/components/partners/partners-manager'
import DebtsManager from '@/components/debts/debts-manager'

function AppContent() {
  const { currentPage } = useNavigation()

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:mr-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'students' && <StudentsList />}
        {currentPage === 'student-detail' && <StudentDetail />}
        {currentPage === 'courses' && <CoursesManager />}
        {currentPage === 'funded' && <FundedAccountsManager />}
        {currentPage === 'partners' && <PartnersManager />}
        {currentPage === 'accounting' && <Accounting />}
        {currentPage === 'reports' && <MonthlyReport />}
        {currentPage === 'debts' && <DebtsManager />}
        {currentPage === 'users' && <UsersManager />}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  )
}
