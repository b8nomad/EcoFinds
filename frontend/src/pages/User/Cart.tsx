import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, ShoppingBag, Package } from 'lucide-react'
import { toast } from 'sonner'
import UserHeader from '@/components/UserHeader'

interface CartItem {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  seller_id: string
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCartItems(data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const removeFromCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setCartItems(cartItems.filter(item => item.id !== productId))
        toast.success('Item removed from cart')
      } else {
        toast.error('Failed to remove item')
      }
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const checkout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      setPurchasing(true)
      const token = localStorage.getItem('token')
      const productIds = cartItems.map(item => item.id)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Purchase completed successfully!')
        setCartItems([])
        // Redirect to orders page
        window.location.href = '/user/orders'
      } else {
        toast.error(data.message || 'Failed to complete purchase')
      }
    } catch (error) {
      toast.error('Failed to complete purchase')
    } finally {
      setPurchasing(false)
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative">
      <UserHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Shopping Cart</h1>
          <p className="text-gray-400 mt-2">{cartItems.length} items in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-200 mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-4">Add some eco-friendly products to get started!</p>
            <Button onClick={() => window.location.href = '/user'}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-gray-900 border border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-100 truncate">{item.name}</h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                            {item.category}
                          </span>
                          <span className="text-xl font-bold text-green-400">${item.price}</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4 bg-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items ({cartItems.length})</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="text-green-400">Free</span>
                    </div>
                    <div className="border-t border-gray-800 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-xl text-green-400">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={checkout} 
                    disabled={purchasing || cartItems.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {purchasing ? 'Processing...' : 'Checkout'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart