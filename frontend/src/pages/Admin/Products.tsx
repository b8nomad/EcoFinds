import { useEffect, useState } from 'react'
import AdminHeader from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Package } from 'lucide-react'

type Product = {
    id: string; name: string; description: string; category: string; price: number;
    status: 'UNDER_REVIEW' | 'ACTIVE' | 'INACTIVE' | 'SOLD';
    seller?: { id: string; name: string; email: string };
    image_url?: string;
}

const Products = () => {
    const base = import.meta.env.VITE_API_URL
    const token = localStorage.getItem('token')
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<Product[]>([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<'ALL' | 'UNDER_REVIEW' | 'ACTIVE' | 'INACTIVE' | 'SOLD'>('ALL')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
    })
    const categories = [
        'Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports',
        'Beauty', 'Toys', 'Automotive', 'Food', 'Other'
    ]

    const fetchData = async () => {
        setLoading(true)
        const qs = new URLSearchParams()
        if (search.trim()) qs.append('search', search.trim())
        if (status !== 'ALL') qs.append('status', status)
        const res = await fetch(`${base}/admin/products?${qs}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) setItems(data.data.products || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, []) // initial load

    const updateStatus = async (id: string, st: Product['status']) => {
        const res = await fetch(`${base}/admin/products/${id}/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: st })
        })
        if (res.ok) fetchData()
    }

    const openEditModal = (p: Product) => {
        setEditingProduct(p)
        setFormData({
            name: p.name,
            description: p.description,
            category: p.category,
            price: String(p.price),
        })
        setIsModalOpen(true)
    }

    const editProduct = async () => {
        if (!editingProduct) return
        if (!formData.name || !formData.description || !formData.category || !formData.price) {
            return
        }
        try {
            setSubmitting(true)
            const res = await fetch(`${base}/admin/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    price: formData.price
                })
            })
            if (res.ok) {
                setIsModalOpen(false)
                setEditingProduct(null)
                await fetchData()
            }
        } finally {
            setSubmitting(false)
        }
    }

    function setRole(value: string) {
        setStatus(value as typeof status);
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <AdminHeader />
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">Product Moderation</h1>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    rows={3}
                                    className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the product"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                        <SelectTrigger className="bg-gray-900 border-gray-800 text-gray-100">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border border-gray-800 text-gray-100">
                                            {categories.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="price">Price ($) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button onClick={editProduct} disabled={submitting} className="flex-1">
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <div className="flex-1">
                        <Label htmlFor="product-search" className="sr-only">Search products</Label>
                        <Input
                            id="product-search"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <Label className="sr-only">Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                            <SelectTrigger className="bg-gray-900 border-gray-800 text-gray-100">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border border-gray-800 text-gray-100">
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="UNDER_REVIEW">UNDER_REVIEW</SelectItem>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                <SelectItem value="SOLD">SOLD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-2">
                            <Button onClick={fetchData}>Apply</Button>
                            <Button variant="secondary"
                                onClick={() => { setSearch(''); setRole('ALL'); fetchData() }}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? <p>Loading...</p> : (
                    <div className="space-y-3">
                        {items.map(p => (
                            <Card key={p.id} className="bg-gray-900 border border-gray-800 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0 gap-3">
                                        {/* Thumbnail */}
                                        <div className="w-12 h-12 rounded border border-gray-800 bg-gray-800 overflow-hidden flex-shrink-0">
                                            {p.image_url ? (
                                                <img
                                                    src={`${import.meta.env.VITE_IMAGE_URL}/${p.image_url}`}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-100 truncate">{p.name}</div>
                                            <div className="text-xs text-gray-400 truncate">{p.description}</div>
                                            <div className="text-xs text-gray-500">
                                                Seller: {p.seller?.name} • ${Number(p.price).toFixed(2)} • {p.category} • {p.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {p.status === 'UNDER_REVIEW' && (
                                            <>
                                                <Button className="bg-green-800 hover:bg-green-700 text-white border border-green-700"
                                                    onClick={() => updateStatus(p.id, 'ACTIVE')}>Approve</Button>
                                                <Button className="bg-yellow-800 hover:bg-yellow-700 text-white border border-yellow-700"
                                                    onClick={() => updateStatus(p.id, 'INACTIVE')}>Reject</Button>
                                            </>
                                        )}
                                        <Button
                                            className="bg-blue-800 hover:bg-blue-700 text-white border border-blue-700"
                                            onClick={() => updateStatus(p.id, 'SOLD')}
                                            disabled={p.status === 'SOLD'}
                                        >
                                            Mark SOLD
                                        </Button>
                                        {p.status === 'ACTIVE' ? (
                                            <Button
                                                className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                                                onClick={() => updateStatus(p.id, 'INACTIVE')}
                                                disabled={p.status === 'SOLD' as Product['status']}
                                            >
                                                Deactivate
                                            </Button>
                                        ) : (
                                            <Button
                                                className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                                                onClick={() => updateStatus(p.id, 'ACTIVE')}
                                                disabled={p.status === 'SOLD'}
                                            >
                                                Reactivate
                                            </Button>
                                        )}
                                        <Button
                                            className="text-white bg-gray-800/80 hover:bg-gray-700 border border-gray-700"
                                            onClick={() => openEditModal(p)}
                                            disabled={p.status === 'SOLD'}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Products
