import { useEffect, useState } from 'react'
import AdminHeader from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { User as UserIcon } from 'lucide-react'

type UserRow = {
    id: string; name: string; email: string; role: 'USER' | 'ADMIN'; created_at: string;
    productCount: number; orderCount: number; image_url?: string;
}

const Users = () => {
    const base = import.meta.env.VITE_API_URL
    const token = localStorage.getItem('token')
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState<UserRow[]>([])
    const [search, setSearch] = useState('')
    const [role, setRole] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')

    const fetchData = async () => {
        setLoading(true)
        const qs = new URLSearchParams()
        if (search.trim()) qs.append('search', search.trim())
        if (role !== 'ALL') qs.append('role', role)
        const res = await fetch(`${base}/admin/users?${qs}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) setRows(data.data.users || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const changeRole = async (u: UserRow, r: 'USER' | 'ADMIN') => {
        const res = await fetch(`${base}/admin/users/${u.id}/role`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: r })
        })
        if (res.ok) fetchData()
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <AdminHeader />
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">User Management</h1>

                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <div className="flex-1">
                        <Label htmlFor="user-search" className="sr-only">Search users</Label>
                        <Input
                            id="user-search"
                            placeholder="Search users (name/email)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <Label className="sr-only">Role</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as any)}>
                            <SelectTrigger className="bg-gray-900 border-gray-800 text-gray-100">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border border-gray-800 text-gray-100">
                                <SelectItem value="ALL">All Roles</SelectItem>
                                <SelectItem value="USER">USER</SelectItem>
                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={fetchData}>Apply</Button>
                        <Button variant="secondary"
                            onClick={() => { setSearch(''); setRole('ALL'); fetchData() }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                {loading ? <p>Loading...</p> : (
                    <div className="space-y-3">
                        {rows.map(u => (
                            <Card key={u.id} className="bg-gray-900 border border-gray-800 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0 gap-3">
                                        <div className="w-12 h-12 rounded-full border border-gray-800 bg-gray-800 overflow-hidden flex-shrink-0">
                                            {u.image_url ? (
                                                <img
                                                    src={`${import.meta.env.VITE_IMAGE_URL}/${u.image_url}`}
                                                    alt={u.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <UserIcon className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-100 truncate">
                                                {u.name} <span className="text-xs text-gray-400">({u.email})</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Role: {u.role} • Products: {u.productCount} • Orders: {u.orderCount}
                                            </div>
                                        </div>
                                    </div>
                                    <Select
                                        value={u.role}
                                        onValueChange={(value) => changeRole(u, value as 'USER' | 'ADMIN')}
                                    >
                                        <SelectTrigger className="bg-gray-900 border border-gray-800 text-gray-100 w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border border-gray-800 text-gray-100">
                                            <SelectItem value="USER">USER</SelectItem>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Users
