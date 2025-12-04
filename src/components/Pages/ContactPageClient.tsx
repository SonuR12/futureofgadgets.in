'use client'

import { Mail, Phone, MapPin, Clock, MessageCircle, Package, RefreshCw, Headphones } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useEffect } from 'react';

export default function ContactPageClient() {
  const supportCards = [
    { icon: Package, title: 'Order Support', desc: 'Track orders, updates & changes', color: 'blue' },
    { icon: RefreshCw, title: 'Returns', desc: 'Easy returns & refunds', color: 'green' },
    { icon: Headphones, title: 'Tech Support', desc: 'Product help & guidance', color: 'purple' },
    { icon: MessageCircle, title: 'Live Chat', desc: 'Instant help available', color: 'orange' }
  ];

  const [contactSettings, setContactSettings] = useState({
    email: '',
    phone: '',
    address: '',
    hours: '',
    youtube: '',
    twitter: '',
    instagram: '',
    facebook: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.contact) setContactSettings(data.contact)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 !mt-0">
        {/* Header */}
        <div className="text-center sm:text-left mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Contact Us</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
            Have questions? We&apos;re here to help. Reach out to us through any of the following channels.
          </p>
        </div>

        {/* Quick Support Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
          {supportCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm border hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-${card.color}-100 rounded-full mb-3 sm:mb-4`}>
                <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${card.color}-600`} />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">{card.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
            <h2 className="text-center sm:text-left text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Get in Touch</h2>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mt-1" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-20 mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-40 mb-1 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600 mt-1" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">Email</h3>
                  <a href={`mailto:${contactSettings.email}`} className="text-sm sm:text-base text-blue-600 hover:underline break-all">{contactSettings.email}</a>
                  <p className="text-xs sm:text-sm text-gray-500">We&apos;ll respond within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600 mt-1" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">Phone & Whatsapp</h3>
                  <a href={`tel:${contactSettings.phone}`} className="text-sm sm:text-base text-green-600 hover:underline">{contactSettings.phone}</a>
                  <p className="text-xs sm:text-sm text-gray-500">{contactSettings.hours}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">Address</h3>
                  <span className="text-sm sm:text-base text-indigo-600 break-words">{contactSettings.address}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <Clock className="w-5 h-5 text-purple-600 mt-1" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">Business Hours</h3>
                  <p className="text-sm sm:text-base text-gray-600">{contactSettings.hours}</p>
                </div>
              </div>
              </div>
            )}
            
            {!loading && (contactSettings.youtube || contactSettings.twitter || contactSettings.instagram || contactSettings.facebook) && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {contactSettings.youtube && (
                    <a href={contactSettings.youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <img src="/share/youtube.png" alt="YouTube" className="w-10 h-10" />
                    </a>
                  )}
                  {contactSettings.twitter && (
                    <a href={contactSettings.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <img src="/share/twitter.png" alt="Twitter" className="w-10 h-10" />
                    </a>
                  )}
                  {contactSettings.instagram && (
                    <a href={contactSettings.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <img src="/share/instagram.png" alt="Instagram" className="w-10 h-10" />
                    </a>
                  )}
                  {contactSettings.facebook && (
                    <a href={contactSettings.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <img src="/share/facebook.png" alt="Facebook" className="w-10 h-10" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center sm:text-left">Frequently Asked Questions</h2>
            <div className="max-w-7xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">How can I track my order?</AccordionTrigger>
                  <AccordionContent>
                    You can track your order by visiting the Orders page in your account or using the tracking link sent to your email.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">What is your return policy?</AccordionTrigger>
                  <AccordionContent>
                    We offer 7-day returns on most items. Products must be in original condition with all packaging and accessories.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">How long does shipping take?</AccordionTrigger>
                  <AccordionContent>
                    Standard shipping takes 5-7 business days. Express shipping is also available.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">Do you offer warranty on products?</AccordionTrigger>
                  <AccordionContent>
                    Yes, all products come with manufacturer warranty. Extended warranty options are available at checkout.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">How do I cancel or modify my order?</AccordionTrigger>
                  <AccordionContent>
                    Orders can be cancelled or modified within 1 hour of placement. Contact our support team immediately for assistance.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">What payment methods do you accept?</AccordionTrigger>
                  <AccordionContent>
                    We accept all major credit cards, PayPal, and Cash on Delivery (COD) available in Delhi NCR.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}