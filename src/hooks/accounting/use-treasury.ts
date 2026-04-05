import { useQuery } from '@tanstack/react-query'

export function useTreasuryData() {
  return useQuery({
    queryKey: ['treasury'],
    queryFn: async () => {
      const res = await fetch(`/api/treasury`)
      if (!res.ok) throw new Error('Failed to fetch treasury')
      return res.json()
    }
  })
}
