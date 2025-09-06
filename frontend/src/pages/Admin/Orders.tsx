import { useEffect, useState } from 'react'
import AdminHeader from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input' // added

type OrderRow = {
    id: string
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
    created_at: string
    product: { id: string; name: string; price: number; image_url?: string } | null
    user: { id: string; name: string; email: string }
    seller?: { id: string; name: string; email: string } | null
}

const Orders = () => {
    const token = localStorage.getItem('token')
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState<OrderRow[]>([])
    const [status, setStatus] = useState<'ALL' | OrderRow['status']>('ALL')
    const [keyword, setKeyword] = useState('') // added

    const fetchData = async () => {
        setLoading(true)
        const qs = new URLSearchParams()
        if (status !== 'ALL') qs.append('status', status)
        if (keyword.trim()) qs.append('search', keyword.trim()) // added
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/orders?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) setRows(data.data.orders || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const changeStatus = async (o: OrderRow, s: OrderRow['status']) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/orders/${o.id}/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: s })
        })
        if (res.ok) fetchData()
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <AdminHeader />
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">Order Oversight</h1>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <div className="flex-1">
                        <Label htmlFor="order-search" className="sr-only">Search</Label>
                        <Input
                            id="order-search"
                            placeholder="Search by product, buyer, or seller..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <Label className="sr-only">Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                            <SelectTrigger className="bg-gray-900 border-gray-800 text-gray-100">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border border-gray-800 text-gray-100">
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PENDING">PENDING</SelectItem>
                                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={fetchData}>Apply</Button>
                        <Button variant="secondary" onClick={() => { setStatus('ALL'); setKeyword(''); fetchData() }}>Clear</Button>
                    </div>
                </div>

                {loading ? <p>Loading...</p> : (
                    <div className="space-y-3">
                        {rows.map(o => (
                            <Card key={o.id} className="bg-gray-900 border border-gray-800 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0 gap-3">
                                        {/* Thumbnail */}
                                        <img
                                            src={`${import.meta.env.VITE_IMAGE_URL}/${o.product?.image_url}`}
                                            alt={o.product?.name}
                                            className="w-12 h-12 object-cover rounded border border-gray-800 bg-gray-800 flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-100 truncate">
                                                {o.product?.name} • ${o.product?.price.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Buyer: {o.user?.name} ({o.user?.email}) • Seller: {o.seller?.name || 'N/A'} • {new Date(o.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Select
                                        value={o.status}
                                        onValueChange={(v) => changeStatus(o, v as OrderRow['status'])}
                                    >
                                        <SelectTrigger className="bg-gray-900 border-gray-800 text-gray-100 w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border border-gray-800 text-gray-100">
                                            <SelectItem value="PENDING">PENDING</SelectItem>
                                            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </Card>
                        ))}
                        {rows.length === 0 && <p className="text-gray-400">No orders found.</p>}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders