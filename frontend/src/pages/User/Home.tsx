import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShoppingCart, Search, Package, Leaf } from 'lucide-react'
import { toast } from 'sonner'
import UserHeader from '@/components/UserHeader'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  seller: {
    id: string
    name: string
    location?: string
  }
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
}

const carouselSlides = [
  {
    icon: <Package className="h-16 w-16 text-green-400" />,
    title: 'Welcome to EcoFinds',
    desc: 'Discover and shop eco-friendly products from your community.',
    gradient: 'bg-green-500/10'
  },
  {
    icon: <ShoppingCart className="h-16 w-16 text-blue-400" />,
    title: 'Sell Your Preloved Items',
    desc: 'List your unused items and give them a new life.',
    gradient: 'bg-blue-500/10'
  },
  {
    icon: <Leaf className="h-16 w-16 text-emerald-400" />,
    title: 'Support Sustainable Living',
    desc: 'Every purchase helps reduce waste and supports local sellers.',
    gradient: 'bg-emerald-500/10'
  },
]

const Home = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports',
    'Beauty', 'Toys', 'Automotive', 'Food', 'Other'
  ]

  // Carousel state
  const [carouselIdx, setCarouselIdx] = useState(0)
  const carouselInterval = useRef<NodeJS.Timeout | null>(null)

  // Auto-advance carousel
  useEffect(() => {
    if (searchTerm || selectedCategory) return // pause carousel when searching/filtering
    carouselInterval.current = setInterval(() => {
      setCarouselIdx(idx => (idx + 1) % carouselSlides.length)
    }, 4000)
    return () => { if (carouselInterval.current) clearInterval(carouselInterval.current) }
  }, [searchTerm, selectedCategory])

  // derive accent for current slide (used in glow/particles)
  const accent = ['#22c55e', '#3b82f6', '#10b981'][carouselIdx % 3]

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.data.products)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchTerm, selectedCategory])

  const addToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Product added to cart!')
      } else {
        toast.error(data.message || 'Failed to add to cart')
      }
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchProducts()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'all' ? '' : category)
    setCurrentPage(1)
  }

  // replace the initial loading return with a skeleton grid
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 relative">
        <UserHeader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative">
      <UserHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carousel and Home Intro */}
        {!(searchTerm || selectedCategory) && (
          <div className="mb-8">
            <div className="relative w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shadow-lg">
              {/* Gradient circle */}
              <div
                className={`pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full blur-2xl ${carouselSlides[carouselIdx].gradient}`}
              />
              {/* New subtle animated elements */}
              {/* Top-left small glow */}
              <div
                className="pointer-events-none absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-60 animate-pulse"
                style={{ background: `${accent}33` }}
              />
              {/* Diagonal light beam */}
              <div
                className="pointer-events-none absolute -bottom-8 left-1/3 w-2/3 h-20 rotate-[-15deg] rounded-full opacity-40 animate-pulse"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}33, transparent)` }}
              />
              {/* Floating ping dots */}
              <div className="pointer-events-none absolute top-6 right-1/2">
                <span className="relative block w-2 h-2 rounded-full" style={{ background: accent }}>
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: accent, opacity: 0.35 }} />
                </span>
              </div>
              <div className="pointer-events-none absolute bottom-6 left-12">
                <span className="relative block w-2 h-2 rounded-full" style={{ background: accent }}>
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: accent, opacity: 0.35 }} />
                </span>
              </div>
              {/* Slow rotating ring */}
              <svg
                className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 animate-spin"
                style={{ animationDuration: '14s' }}
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="42" stroke={accent} strokeOpacity="0.25" strokeWidth="2" strokeDasharray="6 8" fill="none" />
              </svg>

              <div className="flex items-center">
                <div className="flex items-center justify-center h-48 w-48 hidden md:flex">
                  {carouselSlides[carouselIdx].icon}
                </div>
                <div className="flex-1 p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-2">{carouselSlides[carouselIdx].title}</h2>
                  <p className="text-gray-300 text-lg">{carouselSlides[carouselIdx].desc}</p>
                </div>
              </div>
              {/* Carousel controls */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {carouselSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`w-3 h-3 rounded-full ${i === carouselIdx ? 'bg-green-400' : 'bg-gray-700'}`}
                    style={{ transition: 'background 0.2s' }}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setCarouselIdx(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* input with leading icon */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48 bg-gray-900 border-gray-800 text-gray-100">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border border-gray-800 text-gray-100">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {(searchTerm || selectedCategory) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setCurrentPage(1)
                fetchProducts()
              }}
              className="border-gray-800"
            >
              Clear
            </Button>
          )}
        </div>

        {/* results summary */}
        <div className="mb-8 text-sm text-gray-400">
          {pagination.totalCount > 0
            ? `Showing ${products.length} of ${pagination.totalCount} results`
            : 'No results'}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group bg-gray-900 border border-gray-800/80 rounded-2xl transition-all hover:-translate-y-1 hover:ring-1 hover:ring-green-500/40 hover:shadow-lg hover:shadow-green-500/5"
            >
              <CardHeader className="p-0">
                <div className="relative aspect-square bg-gray-800/80 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={`${import.meta.env.VITE_IMAGE_URL}/${product.image_url}`}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 line-clamp-1 text-gray-100">{product.name}</CardTitle>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-400">${product.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-300 bg-gray-800/70 border border-gray-700/60 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  <p>Seller: {product.seller.name}</p>
                  {product.seller.location && <p>Location: {product.seller.location}</p>}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => addToCart(product.id)} aria-label={`Add ${product.name} to cart`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <span className="text-sm text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              className="border-gray-800"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-200 mb-2">No products found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
            {(searchTerm || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setCurrentPage(1)
                  fetchProducts()
                }}
                className="border-gray-800"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home