import { useEffect, useState } from 'react'
import AdminHeader from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button' // added
import { Users as UsersIcon, ShoppingBag } from 'lucide-react' // added

type MetricData = {
    productTotals: { status: string; _count: { _all: number } }[]
    usersCount: number
    ordersCount: number
    topCategories: { category: string; _count: { _all: number } }[]
}

const Analytics = () => {
    const token = localStorage.getItem('token')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null) // added
    const [metrics, setMetrics] = useState<MetricData>({ // default, not null
        productTotals: [],
        usersCount: 0,
        ordersCount: 0,
        topCategories: []
    })

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } })
            const data = await res.json().catch(() => ({} as any))
            if (!res.ok) throw new Error(data?.message || 'Request failed')

            const payload = data?.data || {}
            setMetrics({
                productTotals: Array.isArray(payload.productTotals) ? payload.productTotals : [],
                usersCount: Number(payload.usersCount ?? 0),
                ordersCount: Number(payload.ordersCount ?? 0),
                topCategories: Array.isArray(payload.topCategories) ? payload.topCategories : [],
            })
        } catch (e: any) {
            setError(e?.message || 'Failed to load analytics')
            // keep previous/fallback metrics
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    // derive chart data
    const statusParts = (() => {
        const palette = ['#22c55e', '#f59e0b', '#3b82f6', '#eab308', '#ef4444', '#a855f7', '#14b8a6', '#f97316']
        const total = metrics.productTotals.reduce((s, x) => s + (x._count?._all ?? 0), 0)
        let ci = 0
        const parts = metrics.productTotals.map(s => {
            const value = s._count?._all ?? 0
            const color = palette[ci++ % palette.length]
            return { label: s.status, value, color }
        })
        return { parts, total }
    })()

    const buildConicGradient = (parts: { label: string; value: number; color: string }[]) => {
        const total = parts.reduce((s, p) => s + p.value, 0)
        if (!total) return 'conic-gradient(#1f2937 0deg, #1f2937 360deg)' // gray circle
        let acc = 0
        const stops = parts.map(p => {
            const start = (acc / total) * 360
            acc += p.value
            const end = (acc / total) * 360
            return `${p.color} ${start}deg ${end}deg`
        }).join(', ')
        return `conic-gradient(${stops})`
    }

    const topCat = (() => {
        const max = Math.max(1, ...metrics.topCategories.map(c => c._count?._all ?? 0))
        return { max }
    })()

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <AdminHeader />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Marketplace Analytics</h1>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-red-400">
                        {error} <button className="underline" onClick={fetchData}>Try again</button>
                    </div>
                )}

                {loading ? <p>Loading...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Total Users - enhanced */}
                        <Card className="relative overflow-hidden bg-gray-900 border border-gray-800 p-4 hover:border-gray-700 transition">
                            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-2xl" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-gray-400 text-sm">Total Users</div>
                                    <div className="text-3xl font-extrabold text-gray-100 tracking-tight">
                                        {metrics.usersCount}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">All-time</div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-green-500/10 border border-green-700/40 flex items-center justify-center text-green-400">
                                    <UsersIcon className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>

                        {/* Total Orders - enhanced */}
                        <Card className="relative overflow-hidden bg-gray-900 border border-gray-800 p-4 hover:border-gray-700 transition">
                            <div className="pointer-events-none absolute -top-12 -right-8 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-gray-400 text-sm">Total Orders</div>
                                    <div className="text-3xl font-extrabold text-gray-100 tracking-tight">
                                        {metrics.ordersCount}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">All-time</div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-700/40 flex items-center justify-center text-blue-400">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>

                        {/* Products by Status - pie + legend */}
                        <Card className="bg-gray-900 border border-gray-800 p-4">
                            <div className="text-gray-400 text-sm mb-3">Products by Status</div>
                            <div className="flex items-center gap-6">
                                <div
                                    className="w-28 h-28 rounded-full border border-gray-800"
                                    style={{ background: buildConicGradient(statusParts.parts) }}
                                />
                                <div className="flex-1 space-y-2">
                                    {statusParts.parts.length === 0 ? (
                                        <div className="text-gray-500 text-sm">No products yet</div>
                                    ) : statusParts.parts.map(p => {
                                        const pct = statusParts.total ? Math.round((p.value / statusParts.total) * 100) : 0
                                        return (
                                            <div key={p.label} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-block w-3 h-3 rounded-sm" style={{ background: p.color }} />
                                                    <span className="text-gray-200">{p.label}</span>
                                                </div>
                                                <span className="text-gray-300">{p.value} ({pct}%)</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </Card>

                        {/* Top categories - horizontal bars */}
                        <Card className="bg-gray-900 border border-gray-800 p-4 md:col-span-2">
                            <div className="text-gray-400 text-sm mb-3">Top Categories</div>
                            <div className="space-y-3">
                                {metrics.topCategories.length === 0 ? (
                                    <div className="text-gray-500 text-sm">No categories yet</div>
                                ) : metrics.topCategories.map((c, i) => {
                                    const val = c._count?._all ?? 0
                                    const width = Math.max(4, Math.round((val / topCat.max) * 100)) // min 4% for visibility
                                    return (
                                        <div key={c.category}>
                                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                                <span className="truncate pr-2">{c.category}</span>
                                                <span>{val}</span>
                                            </div>
                                            <div className="w-full h-2 rounded bg-gray-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded"
                                                    style={{
                                                        width: `${width}%`,
                                                        background: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'][i % 5]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Analytics