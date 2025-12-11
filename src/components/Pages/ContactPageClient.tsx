'use client'

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Package,
  RefreshCw,
  Headphones,
} from 'lucide-react'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useState, useEffect } from 'react'

type ContactSettings = {
  email: string
  phone: string
  address: string
  hours: string
  youtube: string
  twitter: string
  instagram: string
  facebook: string
}

export default function ContactPageClient() {
  const supportCards = [
    {
      icon: Package,
      title: 'Order Support',
      desc: 'Track orders, updates & changes',
      bgClass: 'bg-sky-50',
      iconClass: 'text-sky-700',
    },
    {
      icon: RefreshCw,
      title: 'Returns',
      desc: 'Returns, exchanges & refunds',
      bgClass: 'bg-emerald-50',
      iconClass: 'text-emerald-700',
    },
    {
      icon: Headphones,
      title: 'Tech Support',
      desc: 'Product help & guidance',
      bgClass: 'bg-indigo-50',
      iconClass: 'text-indigo-700',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      desc: 'Instant assistance (when available)',
      bgClass: 'bg-amber-50',
      iconClass: 'text-amber-700',
    },
  ]

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: '',
    phone: '',
    address: '',
    hours: '',
    youtube: '',
    twitter: '',
    instagram: '',
    facebook: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.contact) setContactSettings(data.contact)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 shadow-sm">
                Support &amp; Assistance
              </p>
              <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Contact Us
              </h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-500">
                Have questions? We&apos;re here to help. Reach out through any of the options below and we&apos;ll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </header>

        {/* Quick Support Cards */}
        <section className="mb-10 sm:mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {supportCards.map((card, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${card.bgClass}`}
                  >
                    <card.icon className={`h-5 w-5 ${card.iconClass}`} />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Get in Touch */}
        <section className="mb-8 sm:mb-10">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">
              Get in Touch
            </h2>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 h-5 w-5 rounded bg-slate-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="mb-2 h-4 w-24 rounded bg-slate-200 animate-pulse" />
                      <div className="mb-1 h-3 w-40 rounded bg-slate-200 animate-pulse" />
                      <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Email */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="mt-1 h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      Email
                    </h3>
                    <a
                      href={`mailto:${contactSettings.email}`}
                      className="break-all text-sm sm:text-base font-medium text-blue-600 hover:underline"
                    >
                      {contactSettings.email}
                    </a>
                    <p className="text-xs sm:text-sm text-slate-500">
                      We usually respond within 24 hours.
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <Phone className="mt-1 h-5 w-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      Phone &amp; WhatsApp
                    </h3>
                    <a
                      href={`tel:${contactSettings.phone}`}
                      className="text-sm sm:text-base font-medium text-green-600 hover:underline"
                    >
                      {contactSettings.phone}
                    </a>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {contactSettings.hours}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <MapPin className="mt-1 h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      Address
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700 break-words">
                      {contactSettings.address}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <Clock className="mt-1 h-5 w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      Business Hours
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700">
                      {contactSettings.hours}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {!loading &&
              (contactSettings.youtube ||
                contactSettings.twitter ||
                contactSettings.instagram ||
                contactSettings.facebook) && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h3 className="mb-3 text-base sm:text-lg font-semibold text-slate-900">
                    Follow Us
                  </h3>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {contactSettings.youtube && (
                      <a
                        href={contactSettings.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-80"
                      >
                        <img
                          src="/share/youtube.png"
                          alt="YouTube"
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        />
                      </a>
                    )}
                    {contactSettings.twitter && (
                      <a
                        href={contactSettings.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-80"
                      >
                        <img
                          src="/share/twitter.png"
                          alt="Twitter"
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        />
                      </a>
                    )}
                    {contactSettings.instagram && (
                      <a
                        href={contactSettings.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-80"
                      >
                        <img
                          src="/share/instagram.png"
                          alt="Instagram"
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        />
                      </a>
                    )}
                    {contactSettings.facebook && (
                      <a
                        href={contactSettings.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-80"
                      >
                        <img
                          src="/share/facebook.png"
                          alt="Facebook"
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        />
                      </a>
                    )}
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    How can I track my order?
                  </AccordionTrigger>
                  <AccordionContent>
                    You can track your order from the Orders section in your account
                    or through the tracking link sent to your registered email / phone.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    What is your return and refund policy?
                  </AccordionTrigger>
                  <AccordionContent>
                    We follow an exchange-only policy. Products must be returned in original condition with all packaging and accessories. Issues must be reported within 24 hours of delivery. Orders in transit can be canceled at zero cost. For complete details, visit our{' '}
                    <Link href="/refund-policy" className="text-blue-600 hover:underline font-medium">
                      Return &amp; Refund Policy
                    </Link>{' '}
                    page.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    How long does shipping take?
                  </AccordionTrigger>
                  <AccordionContent>
                    Standard delivery typically takes 5–7 business days depending on
                    your location. Shipping timelines are estimates and may vary based on courier delays or unforeseen circumstances.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Do you offer warranty on products?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, all products come with a 3-month store warranty. Extended warranty plans are also available for purchase to provide additional coverage beyond the standard period. In case of product faults, customers will be assisted by the nearest authorized service center.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Can I cancel or modify my order?
                  </AccordionTrigger>
                  <AccordionContent>
                    Orders in transit can be canceled at zero cost. If an advance payment has been made and the order is canceled, the refund will be processed within 7 days. Please contact our support team immediately with your order ID for assistance.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    What payment methods do you accept?
                  </AccordionTrigger>
                  <AccordionContent>
                    We accept major debit / credit cards, UPI, net banking and select
                    wallet options. COD only available in Delhi NCR. All payments are processed securely.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">
                    What if I receive a damaged or faulty product?
                  </AccordionTrigger>
                  <AccordionContent>
                    Issues such as damage, malfunction, or missing accessories must be reported within 24 hours of delivery. Products with broken seals or tampered packaging are non-returnable. In case of product faults, you will be assisted by the nearest authorized service center.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-left">
                    Where can I find your Terms of Service?
                  </AccordionTrigger>
                  <AccordionContent>
                    Our complete Terms of Service, including account registration, product information, orders, payments, and intellectual property policies, can be found on our{' '}
                    <Link href="/terms-of-service" className="text-blue-600 hover:underline font-medium">
                      Terms &amp; Conditions
                    </Link>{' '}
                    page.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
