import { useEffect, useState } from 'react'
import AdminHeader from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'

type MetricData = {
    productTotals: { status: string; _count: { _all: number } }[]
    usersCount: number
    ordersCount: number
    topCategories: { category: string; _count: { _all: number } }[]
}

const Analytics = () => {
    const base = import.meta.env.VITE_API_URL
    const token = localStorage.getItem('token')
    const [loading, setLoading] = useState(false)
    const [metrics, setMetrics] = useState<MetricData | null>(null)

    const fetchData = async () => {
        setLoading(true)
        const res = await fetch(`${base}/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) setMetrics(data.data)
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <AdminHeader />
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">Marketplace Analytics</h1>
                {loading ? <p>Loading...</p> : metrics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="bg-gray-900 border border-gray-800 p-4">
                            <div className="text-gray-400 text-sm">Total Users</div>
                            <div className="text-2xl font-bold text-gray-100">{metrics.usersCount}</div>
                        </Card>

                        <Card className="bg-gray-900 border border-gray-800 p-4">
                            <div className="text-gray-400 text-sm">Total Orders</div>
                            <div className="text-2xl font-bold text-gray-100">{metrics.ordersCount}</div>
                        </Card>

                        <Card className="bg-gray-900 border border-gray-800 p-4">
                            <div className="text-gray-400 text-sm">Products by Status</div>
                            <div className="text-sm text-gray-300 space-y-1 mt-2">
                                {metrics.productTotals?.map((s) => (
                                    <div key={s.status} className="flex justify-between">
                                        <span>{s.status}</span>
                                        <span>{s._count._all}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-gray-900 border border-gray-800 p-4 md:col-span-2">
                            <div className="text-gray-400 text-sm">Top Categories</div>
                            <div className="text-sm text-gray-300 space-y-1 mt-2">
                                {metrics.topCategories?.map((c) => (
                                    <div key={c.category} className="flex justify-between">
                                        <span>{c.category}</span>
                                        <span>{c._count._all}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                ) : <p className="text-gray-400">No data</p>}
            </div>
        </div>
    )
}

export default Analytics