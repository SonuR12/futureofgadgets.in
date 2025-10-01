'use client'

import { useState } from 'react'
import { Settings, Home, Info, Mail, Save, Image, Tag, Star, Zap, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [homeSettings, setHomeSettings] = useState({
    heroTitle: 'Welcome to Electronic Store',
    heroSubtitle: 'Find the best electronics at amazing prices',
    featuredProducts: 6,
    carouselImages: 5,
    todayDealsCount: 8,
    flashSaleEnabled: true,
    testimonialCount: 6
  })

  const [aboutSettings, setAboutSettings] = useState({
    title: 'About Electronic Store',
    description: 'We are a leading electronics retailer providing quality products since 2020.',
    mission: 'To provide the best electronics at affordable prices with excellent customer service.'
  })

  const [contactSettings, setContactSettings] = useState({
    email: 'contact@electronic.com',
    phone: '+91 9876543210',
    address: '123 Electronics Street, Tech City, India',
    hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM'
  })

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully!`)
  }

  return (
    <div className="p-6 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your store settings and content</p>
      </div>

      <div className="space-y-8">
        {/* Home Page Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Home className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Home Page Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
              <Input
                value={homeSettings.heroTitle}
                onChange={(e) => setHomeSettings({...homeSettings, heroTitle: e.target.value})}
                placeholder="Main headline for homepage"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
              <Input
                value={homeSettings.heroSubtitle}
                onChange={(e) => setHomeSettings({...homeSettings, heroSubtitle: e.target.value})}
                placeholder="Subtitle description"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Products Count</label>
                <Input
                  type="number"
                  value={homeSettings.featuredProducts}
                  onChange={(e) => setHomeSettings({...homeSettings, featuredProducts: parseInt(e.target.value)})}
                  placeholder="Number of featured products"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carousel Images</label>
                <Input
                  type="number"
                  value={homeSettings.carouselImages}
                  onChange={(e) => setHomeSettings({...homeSettings, carouselImages: parseInt(e.target.value)})}
                  placeholder="Number of carousel slides"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Today&apos;s Deals Count</label>
                <Input
                  type="number"
                  value={homeSettings.todayDealsCount}
                  onChange={(e) => setHomeSettings({...homeSettings, todayDealsCount: parseInt(e.target.value)})}
                  placeholder="Number of daily deals"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Testimonials Count</label>
                <Input
                  type="number"
                  value={homeSettings.testimonialCount}
                  onChange={(e) => setHomeSettings({...homeSettings, testimonialCount: parseInt(e.target.value)})}
                  placeholder="Number of testimonials"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="flashSale"
                checked={homeSettings.flashSaleEnabled}
                onChange={(e) => setHomeSettings({...homeSettings, flashSaleEnabled: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="flashSale" className="text-sm font-medium text-gray-700">Enable Flash Sale Section</label>
            </div>
            
            <Button onClick={() => handleSave('Home page')} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Home Settings
            </Button>
          </div>
        </div>

        

        {/* Carousel Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Image className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Carousel & Banner Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Banner Text</label>
              <Input placeholder="Big Sale - Up to 50% Off!" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Button Text</label>
              <Input placeholder="Shop Now" />
            </div>
          </div>
          
          <Button className="mt-4 flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Carousel Settings
          </Button>
        </div>

        {/* Today's Deals Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Deals Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <Input placeholder="Today's Best Deals" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Range</label>
              <Input placeholder="Up to 70% Off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timer Duration (hours)</label>
              <Input type="number" placeholder="24" />
            </div>
          </div>
          
          <Button className="mt-4 flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Deals Settings
          </Button>
        </div>

        {/* Flash Sale Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">Flash Sale Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flash Sale Title</label>
              <Input placeholder="⚡ Flash Sale - Limited Time!" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sale Duration (minutes)</label>
              <Input type="number" placeholder="60" />
            </div>
          </div>
          
          <Button className="mt-4 flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Flash Sale Settings
          </Button>
        </div>

        {/* Testimonials Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">Customer Testimonials</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <Input placeholder="What Our Customers Say" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="showRatings" className="rounded" />
              <label htmlFor="showRatings" className="text-sm font-medium text-gray-700">Show Star Ratings</label>
            </div>
          </div>
          
          <Button className="mt-4 flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Testimonial Settings
          </Button>
        </div>

        {/* Contact Page Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Contact Page Settings</h2>
          </div>
          
          <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <Input
                type="email"
                value={contactSettings.email}
                onChange={(e) => setContactSettings({...contactSettings, email: e.target.value})}
                placeholder="contact@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <Input
                value={contactSettings.phone}
                onChange={(e) => setContactSettings({...contactSettings, phone: e.target.value})}
                placeholder="+91 9876543210"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <Input
                value={contactSettings.address}
                onChange={(e) => setContactSettings({...contactSettings, address: e.target.value})}
                placeholder="Store address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
              <Input
                value={contactSettings.hours}
                onChange={(e) => setContactSettings({...contactSettings, hours: e.target.value})}
                placeholder="Mon-Fri: 9AM-6PM"
              />
            </div>
          </div>
            
            <Button onClick={() => handleSave('Contact page')} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Contact Settings
            </Button>
          </div>
        </div>

        {/* About Page Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Info className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">About Page Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
              <Input
                value={aboutSettings.title}
                onChange={(e) => setAboutSettings({...aboutSettings, title: e.target.value})}
                placeholder="About page title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={aboutSettings.description}
                onChange={(e) => setAboutSettings({...aboutSettings, description: e.target.value})}
                placeholder="Company description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={aboutSettings.mission}
                onChange={(e) => setAboutSettings({...aboutSettings, mission: e.target.value})}
                placeholder="Company mission"
              />
            </div>
            
            <Button onClick={() => handleSave('About page')} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save About Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

