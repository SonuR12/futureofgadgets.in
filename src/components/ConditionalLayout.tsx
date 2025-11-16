'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from './ui/Navbar'
import BottomNav from './BottomNav'
import TopBanner from './TopBanner'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showBanner, setShowBanner] = useState(true)
  const [bannerHeight, setBannerHeight] = useState(38)

  useEffect(() => {
    const updateHeight = () => {
      setBannerHeight(window.innerWidth >= 768 ? 56 : 38)
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  const bannerVisible = pathname === '/' && showBanner

  return (
    <>
      {bannerVisible && <TopBanner onClose={() => setShowBanner(false)} />}
      <Navbar offsetTop={bannerVisible ? `${bannerHeight}px` : '0px'} />
      <div className={`pt-10 md:pt-14 pb-12 md:pb-0 ${bannerVisible ? 'mt-14' : ''}`}>
        {children}
      </div>
      <BottomNav />
    </>
  )
}
