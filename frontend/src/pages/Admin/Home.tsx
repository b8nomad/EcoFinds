import AdminHeader from '@/components/AdminHeader'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, ShoppingBag, BarChart2 } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border border-gray-800 cursor-pointer" onClick={() => navigate('/admin/products')}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Products</CardTitle></CardHeader>
            <CardContent className="text-gray-400">Moderate listings, approve/reject, edit or toggle status.</CardContent>
          </Card>
          <Card className="bg-gray-900 border border-gray-800 cursor-pointer" onClick={() => navigate('/admin/users')}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Users</CardTitle></CardHeader>
            <CardContent className="text-gray-400">Search users, change roles, and review activity.</CardContent>
          </Card>
          <Card className="bg-gray-900 border border-gray-800 cursor-pointer" onClick={() => navigate('/admin/orders')}>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Orders</CardTitle></CardHeader>
            <CardContent className="text-gray-400">View and manage orders across the platform.</CardContent>
          </Card>
          <Card className="bg-gray-900 border border-gray-800 cursor-pointer" onClick={() => navigate('/admin/analytics')}>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" /> Analytics</CardTitle></CardHeader>
            <CardContent className="text-gray-400">Key metrics and category trends.</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home
