'use client'

import { useState, useEffect, useCallback } from 'react'

interface ExchangeRateData {
  rate: number
  cachedAt: string
  fromCache: boolean
  stale?: boolean
}

interface UseExchangeRateReturn {
  rate: number | null          // ILS per 1 USD  e.g. 3.72
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  convertILStoUSD: (ils: number) => number | null
  convertUSDtoILS: (usd: number) => number | null
  refetch: () => void
}

export function useExchangeRate(): UseExchangeRateReturn {
  const [rate, setRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRate = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/exchange-rate')
      const data = await res.json()

      if (!res.ok) {
        // Server returned fallback rate
        if (data.fallbackRate) {
          setRate(data.fallbackRate)
          setError('تعذّر جلب السعر الحي — يُستخدم سعر تقريبي')
          setLastUpdated(new Date())
        } else {
          throw new Error(data.error || 'فشل جلب سعر الصرف')
        }
      } else {
        const rateData = data as ExchangeRateData
        setRate(rateData.rate)
        setLastUpdated(new Date(rateData.cachedAt))
        if (rateData.stale) {
          setError('السعر محدّث تقريبياً (قد يكون قديماً قليلاً)')
        }
      }
    } catch (err: any) {
      setError(err.message || 'تعذّر جلب سعر الصرف')
      // Use a reasonable fallback so the user isn't stuck
      if (!rate) setRate(3.7)
    } finally {
      setIsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchRate()
  }, [fetchRate])

  const convertILStoUSD = useCallback(
    (ils: number): number | null => {
      if (!rate || ils <= 0) return null
      return Math.round((ils / rate) * 100) / 100
    },
    [rate]
  )

  const convertUSDtoILS = useCallback(
    (usd: number): number | null => {
      if (!rate || usd <= 0) return null
      return Math.round(usd * rate * 100) / 100
    },
    [rate]
  )

  return { rate, isLoading, error, lastUpdated, convertILStoUSD, convertUSDtoILS, refetch: fetchRate }
}
