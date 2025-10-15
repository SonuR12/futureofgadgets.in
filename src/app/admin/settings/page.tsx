'use client'

import { useState, useEffect } from 'react'
import { Settings, Home, Mail, Save, Image, Gift, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import LoadingButton from '@/components/ui/loading-button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>('all')
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sectionProducts, setSectionProducts] = useState({
    dealOfTheDay: [] as string[],
    featuredSection: [] as string[],
    bestSeller: [] as string[],
  })
  const [homeSettings, setHomeSettings] = useState({
    heroTitle: 'Welcome to Electronic Store',
    heroSubtitle: 'Find the best electronics at amazing prices',
    featuredProducts: 6,
    carouselImages: 5,
    todayDealsCount: 8,
    flashSaleEnabled: true,
    testimonialCount: 6
  })

  const [sliderSettings, setSliderSettings] = useState([
    { id: 1, title: '', offer: '', buttonText1: '', buttonText2: '', image: '', link: '' },
    { id: 2, title: '', offer: '', buttonText1: '', buttonText2: '', image: '', link: '' },
    { id: 3, title: '', offer: '', buttonText1: '', buttonText2: '', image: '', link: '' }
  ])
  const [sliderFiles, setSliderFiles] = useState<(File | null)[]>([null, null, null])
  const [sliderPreviews, setSliderPreviews] = useState<string[]>(['', '', ''])

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width, height = img.height
          const maxSize = 1200
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => resolve(new File([blob!], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.85)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const uploadSliderImages = async () => {
    const updated = [...sliderSettings]
    for (let i = 0; i < sliderFiles.length; i++) {
      if (sliderFiles[i]) {
        const compressed = await compressImage(sliderFiles[i]!)
        const formData = new FormData()
        formData.append('file', compressed)
        const res = await fetch('/api/upload-single', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) updated[i].image = data.url
      }
    }
    return updated
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([data, productsData]) => {
      if (data.home) setHomeSettings(data.home)
      if (data.slider) {
        setSliderSettings(data.slider)
        setSliderFiles(data.slider.map(() => null))
        setSliderPreviews(data.slider.map((s: any) => s.image || ''))
      }
      if (data.about) setAboutSettings(data.about)
      if (data.contact) setContactSettings(data.contact)
      if (data.sectionProducts) {
        const { newArrivals, trendingNow, ...rest } = data.sectionProducts
        setSectionProducts(rest)
      }
      setProducts(productsData || [])
    }).catch(() => {})
  }, [])

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

  const handleSave = async (section: string, tag: string, data: any) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, data })
      })
      if (res.ok) {
        toast.success(`${section} settings saved successfully!`)
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const sections = [
    { id: 'all', name: 'All', icon: Settings, color: 'text-gray-600' },
    { id: 'home', name: 'Home Page', icon: Home, color: 'text-blue-600' },
    { id: 'slider', name: 'Home Slider', icon: Image, color: 'text-indigo-600' },
    { id: 'contact', name: 'Contact Page', icon: Mail, color: 'text-purple-600' },
  ]

  const sectionNames: Record<string, string> = {
    dealOfTheDay: 'Deal of the Day',
    featuredSection: 'Featured Section',
    bestSeller: 'Best Seller',
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white px-6 py-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your store settings and content</p>
      </header>

      <div className="flex text-sm overflow-x-auto gap-8 px-6 py-4 border-b">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`pb-0 font-medium border-b-2 transition whitespace-nowrap ${
              activeSection === section.id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-400 hover:text-gray-600 cursor-pointer'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {activeSection === 'all' ? (
          <div className="space-y-8">
            {renderSection('home')}
            {renderSection('slider')}
            {renderSection('contact')}
          </div>
        ) : activeSection ? (
          renderSection(activeSection)
        ) : (
          <div className="space-y-8">
            {renderSection('home')}
            {renderSection('slider')}
            {renderSection('contact')}
          </div>
        )}
      </div>
    </div>
  )

  function renderSection(id: string) {
    switch(id) {
      case 'home':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Home className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Home Page Sections</h2>
            </div>
          
          <div className="space-y-6">
            {Object.entries(sectionProducts).map(([key, selectedIds]) => (
              <div key={key} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{sectionNames[key]}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-start gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(e) => {
                          const updated = { ...sectionProducts }
                          if (e.target.checked) {
                            updated[key as keyof typeof sectionProducts] = [...selectedIds, product.id]
                          } else {
                            updated[key as keyof typeof sectionProducts] = selectedIds.filter(id => id !== product.id)
                          }
                          setSectionProducts(updated)
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">₹{product.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{selectedIds.length} products selected</p>
              </div>
            ))}
            
              <LoadingButton onClick={() => handleSave('Section products', 'sectionProducts', sectionProducts)} loading={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Product Assignments
              </LoadingButton>
            </div>
          </div>
        )
      case 'slider':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Image className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Home Slider Settings</h2>
              <span>(Atleast 3 Slider is Always show)</span>
            </div>
            <Button
              onClick={() => {
                const newSlide = {
                  id: sliderSettings.length + 1,
                  title: '',
                  offer: '',
                  buttonText1: '',
                  buttonText2: '',
                  image: '',
                  link: '/products'
                }
                setSliderSettings([...sliderSettings, newSlide])
              }}
              className="flex items-center gap-2"
            >
              <Gift className="h-4 w-4" />
              Add Slider
            </Button>
          </div>
          
          {sliderSettings.map((slide, index) => (
            <div key={slide.id} className="mb-6 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Slide {index + 1}</h3>
                {sliderSettings.length > 3 ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Slide?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this slide. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          variant='destructive'
                          onClick={() => {
                            const updated = sliderSettings.filter((_, i) => i !== index)
                            setSliderSettings(updated)
                            toast.success('Slide deleted successfully')
                          }}
                        >
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button variant="destructive" size="sm" disabled title="Minimum 3 slides required">
                    Delete
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <Input
                    value={slide.title}
                    onChange={(e) => {
                      const updated = [...sliderSettings]
                      updated[index].title = e.target.value
                      setSliderSettings(updated)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Offer Text</label>
                  <Input
                    value={slide.offer}
                    onChange={(e) => {
                      const updated = [...sliderSettings]
                      updated[index].offer = e.target.value
                      setSliderSettings(updated)
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button 1 Text</label>
                    <Input
                      value={slide.buttonText1}
                      onChange={(e) => {
                        const updated = [...sliderSettings]
                        updated[index].buttonText1 = e.target.value
                        setSliderSettings(updated)
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 Text</label>
                    <Input
                      value={slide.buttonText2}
                      onChange={(e) => {
                        const updated = [...sliderSettings]
                        updated[index].buttonText2 = e.target.value
                        setSliderSettings(updated)
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Redirect Link</label>
                  <Input
                    value={slide.link}
                    placeholder="/products"
                    onChange={(e) => {
                      const updated = [...sliderSettings]
                      updated[index].link = e.target.value
                      setSliderSettings(updated)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slide Image</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const files = [...sliderFiles]
                          files[index] = file
                          setSliderFiles(files)
                          const previews = [...sliderPreviews]
                          previews[index] = URL.createObjectURL(file)
                          setSliderPreviews(previews)
                        }
                      }}
                    />
                    {(sliderFiles[index] || slide.image) && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const files = [...sliderFiles]
                          files[index] = null
                          setSliderFiles(files)
                          const previews = [...sliderPreviews]
                          previews[index] = ''
                          setSliderPreviews(previews)
                          const updated = [...sliderSettings]
                          updated[index].image = ''
                          setSliderSettings(updated)
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {(sliderPreviews[index] || slide.image) && (
                    <img src={sliderPreviews[index] || slide.image} alt="Preview" className="mt-2 h-20 object-contain" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <Button onClick={async () => {
            const loadingToast = toast.loading('Uploading images and saving...')
            try {
              const updated = await uploadSliderImages()
              await handleSave('Slider', 'slider', updated)
              setSliderFiles(updated.map(() => null))
              toast.dismiss(loadingToast)
            } catch (error) {
              toast.error('Failed to save', { id: loadingToast })
            }
          }} className="mt-4 flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Slider Settings
            </Button>
          </div>
        )
      case 'contact':
        return (
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
            
              <Button onClick={() => handleSave('Contact page', 'contact', contactSettings)} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Contact Settings
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }
}
