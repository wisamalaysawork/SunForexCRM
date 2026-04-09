import { NextResponse } from 'next/server'

// Simple in-memory cache to avoid hammering the external API
let cachedRate: number | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

export async function GET() {
  try {
    const now = Date.now()

    // Return cached value if still fresh
    if (cachedRate && now - cacheTimestamp < CACHE_DURATION_MS) {
      return NextResponse.json({
        rate: cachedRate,
        pair: 'USD/ILS',
        cachedAt: new Date(cacheTimestamp).toISOString(),
        fromCache: true,
      })
    }

    // Fetch from free public API (no key required)
    const response = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`)
    }

    const data = await response.json()
    const ilsRate: number = data?.rates?.ILS

    if (!ilsRate || typeof ilsRate !== 'number') {
      throw new Error('ILS rate not found in response')
    }

    // Update cache
    cachedRate = ilsRate
    cacheTimestamp = now

    return NextResponse.json({
      rate: ilsRate,
      pair: 'USD/ILS',
      cachedAt: new Date(now).toISOString(),
      fromCache: false,
    })
  } catch (error: any) {
    console.error('[exchange-rate] Failed to fetch rate:', error.message)

    // Fall back to cached value even if stale
    if (cachedRate) {
      return NextResponse.json({
        rate: cachedRate,
        pair: 'USD/ILS',
        cachedAt: new Date(cacheTimestamp).toISOString(),
        fromCache: true,
        stale: true,
      })
    }

    // Last resort: return a reasonable fallback (approximate market rate)
    return NextResponse.json(
      { error: 'تعذّر جلب سعر الصرف', fallbackRate: 3.7 },
      { status: 503 }
    )
  }
}
