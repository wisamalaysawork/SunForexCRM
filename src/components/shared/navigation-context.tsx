'use client'

import { useState, createContext, useContext, ReactNode } from 'react'

type Page = 'dashboard' | 'students' | 'courses' | 'funded' | 'accounting' | 'reports' | 'student-detail' | 'users' | 'partners'

interface NavigationContextType {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  selectedStudentId: string | null
  setSelectedStudentId: (id: string | null) => void
  refreshKey: number
  triggerRefresh: () => void
}

const NavigationContext = createContext<NavigationContextType>({
  currentPage: 'dashboard',
  setCurrentPage: () => {},
  selectedStudentId: null,
  setSelectedStudentId: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
})

export function useNavigation() {
  return useContext(NavigationContext)
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <NavigationContext.Provider value={{
      currentPage,
      setCurrentPage,
      selectedStudentId,
      setSelectedStudentId,
      refreshKey,
      triggerRefresh,
    }}>
      {children}
    </NavigationContext.Provider>
  )
}
