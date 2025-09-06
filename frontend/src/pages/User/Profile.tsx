import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Lock } from 'lucide-react'
import { toast } from 'sonner'
import UserHeader from '@/components/UserHeader'

interface UserProfile {
  id: string
  name: string
  email: string
  location?: string
  image_url?: string
  created_at: string
  role: string
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    image_url: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          location: data.data.location || '',
          image_url: data.data.image_url || ''
        })
      }
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const updateProfile = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Profile updated successfully!')
        setProfile(data.data)
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordForm(false)
      } else {
        toast.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Profile Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <Label htmlFor="image_url">Profile Image URL</Label>
                  <Input
                    id="image_url"
                    className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <Button onClick={updateProfile} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Password Change Card */}
            <Card className="mt-6 bg-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100">Password & Security</CardTitle>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="bg-gray-900 text-gray-100 placeholder:text-gray-400 border-gray-800"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={changePassword} disabled={saving} className="flex-1">
                        {saving ? 'Changing...' : 'Change Password'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Summary */}
          <div>
            <Card className="bg-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100">Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile?.image_url && (
                    <div className="flex justify-center">
                      <img
                        src={profile.image_url}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="font-semibold text-lg text-gray-100">{profile?.name}</h3>
                    <p className="text-gray-400">{profile?.email}</p>
                    {profile?.location && (
                      <p className="text-sm text-gray-400">{profile.location}</p>
                    )}
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Role:</span>
                      <span className="font-medium text-gray-200">{profile?.role}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-400">Member since:</span>
                      <span className="font-medium text-gray-200">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile