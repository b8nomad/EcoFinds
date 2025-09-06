import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Package, LogOut, Home } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const UserHeader = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const active = (route: string) => pathname === route || pathname.startsWith(route)

    return (
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div
                        className="flex items-center cursor-pointer select-none"
                        onClick={() => navigate('/user')}
                        title="Go to Home"
                    >
                        <h1 className="text-2xl font-bold text-green-400">EcoFinds</h1>
                    </div>

                    <nav className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/user')}
                            className={`hover:bg-gray-800 ${active('/user') && pathname === '/user' ? 'text-green-400 bg-gray-800/60' : ''}`}
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/user/cart')}
                            className={`hover:bg-gray-800 ${active('/user/cart') ? 'text-green-400 bg-gray-800/60' : ''}`}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Cart
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/user/profile')}
                            className={`hover:bg-gray-800 ${active('/user/profile') ? 'text-green-400 bg-gray-800/60' : ''}`}
                        >
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/user/my-products')}
                            className={`hover:bg-gray-800 ${active('/user/my-products') ? 'text-green-400 bg-gray-800/60' : ''}`}
                        >
                            <Package className="h-4 w-4 mr-2" />
                            My Products
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/user/orders')}
                            className={`hover:bg-gray-800 ${active('/user/orders') ? 'text-green-400 bg-gray-800/60' : ''}`}
                        >
                            <Package className="h-4 w-4 mr-2" />
                            My Orders
                        </Button>
                        <Button variant="ghost" size="sm" onClick={logout} className="hover:bg-gray-800">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default UserHeader
