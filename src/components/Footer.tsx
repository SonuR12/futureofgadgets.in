'use client'

import Link from "next/link";
import { useEffect, useState } from "react";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  const [socialLinks, setSocialLinks] = useState({ youtube: '', twitter: '', instagram: '', facebook: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.contact) {
          setSocialLinks({
            youtube: data.contact.youtube || '',
            twitter: data.contact.twitter || '',
            instagram: data.contact.instagram || '',
            facebook: data.contact.facebook || ''
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className={`bg-gradient-to-b from-gray-900 to-black text-white ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:pt-16">

        {/* UPDATED GRID: md = 4 columns, lg = 5 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10">

          {/* Brand Section — stays full width on small screens */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="h-10 w-full rounded" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Future Of Gadgets
              </h3>
            </div>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-sm">
              Your trusted partner for cutting-edge electronics and innovative tech gadgets.
            </p>

            <div className="flex space-x-3">
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                  <img src="/share/youtube.png" alt="YouTube" className="w-6 h-6" />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                  <img src="/share/twitter.png" alt="Twitter" className="w-6 h-6" />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                  <img src="/share/instagram.png" alt="Instagram" className="w-6 h-6" />
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                  <img src="/share/facebook.png" alt="Facebook" className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/search?q=laptops', label: 'Laptops' },
                { href: '/search?q=Open%20Box%20Laptop%27s', label: 'Open Box Laptops' },
                { href: '/search?q=refurbished%20laptops', label: 'Refurbished Laptops' },
                { href: '/search?q=desktops', label: 'Monitors' },
                { href: '/category', label: 'All Categories' }
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => window.scrollTo(0, 0)} className="text-gray-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white">Service</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/orders', label: 'Track Orders' },
                { href: '/contact', label: 'FAQ' }
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} onClick={() => window.scrollTo(0, 0)} className="text-gray-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/products', label: 'All Products' },
                { href: '/wishlist', label: 'Wishlist' },
                { href: '/cart', label: 'Shopping Cart' },
                { href: '/profile', label: 'My Account' }
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => window.scrollTo(0, 0)} className="text-gray-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400 text-center sm:text-left">
            <p>© 2025 Future Of Gadgets. All rights reserved.</p>
            <p className="mt-1">
              Made by{' '}
              <Link href="https://www.linkedin.com/in/sonu-rai-r12/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sonu
              </Link>
              {' '}and{' '}
              <Link href="https://www.linkedin.com/in/aakash-singh-575205310/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                Aakash
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
            {[
              { href: '/terms-of-service', label: 'Terms of Service' },
              { href: '/refund-policy', label: 'Refund Policy' },
              { href: '/privacy-policy', label: 'Privacy Policy' },
              { href: '/cookie-policy', label: 'Cookie Policy' }
            ].map(link => (
              <Link key={link.href} href={link.href} onClick={() => window.scrollTo(0, 0)}
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
