import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Package, Upload } from 'lucide-react'
import { toast } from 'sonner'
import UserHeader from '@/components/UserHeader'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  status: string
  created_at: string
}

const MyProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports',
    'Beauty', 'Toys', 'Automotive', 'Food', 'Other'
  ]

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyProducts()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
    })
    setEditingProduct(null)
    setImageFile(null)
    setPreview('')
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
    })
    setImageFile(null)
    setPreview(`${import.meta.env.VITE_IMAGE_URL}/${product.image_url}` || '')
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const onFileSelected = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    onFileSelected(file)
  }

  const submitProduct = async () => {
    if (!formData.name || !formData.description || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
      const url = editingProduct
        ? `${import.meta.env.VITE_API_URL}/user/products/${editingProduct.id}`
        : `${import.meta.env.VITE_API_URL}/user/products`
      const method = editingProduct ? 'PUT' : 'POST'

      const body = new FormData()
      body.append('name', formData.name)
      body.append('description', formData.description)
      body.append('category', formData.category)
      body.append('price', formData.price)
      if (imageFile) {
        body.append('image', imageFile)
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
        setIsModalOpen(false)
        setImageFile(null)
        setPreview('')
        resetForm()
        fetchMyProducts()
      } else {
        toast.error(data.message || 'Failed to save product')
      }
    } catch (error) {
      toast.error('Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Product deleted successfully!')
        setProducts(products.filter(p => p.id !== productId))
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-900/30 text-green-400 border border-green-800'
      case 'UNDER_REVIEW': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
      case 'INACTIVE': return 'bg-gray-800 text-gray-300 border border-gray-700'
      case 'SOLD': return 'bg-blue-900/30 text-blue-400 border border-blue-800'
      default: return 'bg-gray-800 text-gray-300 border border-gray-700'
    }
  }

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">My Products</h1>
            <p className="text-gray-400 mt-2">{products.length} products listed</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
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
                    placeholder="Describe your product"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="bg-gray-900 border-gray-800 text-gray-100">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
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

                <div>
                  <Label>Product Image</Label>
                  {preview ? (
                    <div className="mt-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-800"
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-800"
                          onClick={() => {
                            setImageFile(null)
                            setPreview('')
                          }}
                        >
                          Remove
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-800"
                          onClick={() => document.getElementById('file-input-hidden')?.click()}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-input-hidden')?.click()}
                      className="mt-2 flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed rounded-lg border-gray-800 bg-gray-900 hover:bg-gray-900/80 transition-colors cursor-pointer"
                    >
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-300">Drag and drop an image here, or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 5MB</p>
                    </div>
                  )}
                  <input
                    id="file-input-hidden"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileSelected(e.target.files?.[0] || undefined)}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={submitProduct} disabled={submitting} className="flex-1">
                    {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
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
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-200 mb-2">No products yet</h3>
            <p className="text-gray-400 mb-4">Start selling by adding your first product!</p>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
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
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 line-clamp-1 text-gray-100">{product.name}</CardTitle>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-400">${Number(product.price).toFixed(2)}</span>
                    <span className="text-xs text-gray-300 bg-gray-800/70 border border-gray-700/60 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Created: {new Date(product.created_at).toLocaleDateString()}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(product)}
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 border-gray-700 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div >
  )
}

export default MyProducts