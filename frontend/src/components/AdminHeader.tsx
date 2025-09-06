import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Home, BarChart2, Users, ShoppingBag, Package, LogOut } from 'lucide-react'

const AdminHeader = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const active = (route: string) => pathname === route

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div
          className="text-2xl font-bold text-green-400 cursor-pointer select-none"
          onClick={() => navigate('/admin')}
          title="Admin Dashboard"
        >
          EcoFinds Admin
        </div>
        <nav className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}
            className={`hover:bg-gray-800 ${active('/admin/') ? 'text-green-400 bg-gray-800/60' : ''}`}>
            <Home className="h-4 w-4 mr-2" /> Home
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}
            className={`hover:bg-gray-800 ${active('/admin/products') ? 'text-green-400 bg-gray-800/60' : ''}`}>
            <Package className="h-4 w-4 mr-2" /> Products
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}
            className={`hover:bg-gray-800 ${active('/admin/users') ? 'text-green-400 bg-gray-800/60' : ''}`}>
            <Users className="h-4 w-4 mr-2" /> Users
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}
            className={`hover:bg-gray-800 ${active('/admin/orders') ? 'text-green-400 bg-gray-800/60' : ''}`}>
            <ShoppingBag className="h-4 w-4 mr-2" /> Orders
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')}
            className={`hover:bg-gray-800 ${active('/admin/analytics') ? 'text-green-400 bg-gray-800/60' : ''}`}>
            <BarChart2 className="h-4 w-4 mr-2" /> Analytics
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="hover:bg-gray-800">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </nav>
      </div>
    </header>
  )
}

export default AdminHeader
