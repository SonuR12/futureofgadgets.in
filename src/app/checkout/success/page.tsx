'use client'

import Link from 'next/link'
import { CheckCircle, Package, Mail, Phone, MessageCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 py-16">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully! 🎉</h1>
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
          <p className="text-sm text-gray-500">
            You will receive an email confirmation shortly with your order details.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Track Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Track Your Orders</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor your order status and delivery updates in real-time.
            </p>
            <Link href="/orders">
              <Button className="w-full flex items-center justify-center gap-2 cursor-pointer">
                View Orders <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Continue Shopping */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 text-green-600">🛍️</div>
              <h3 className="text-lg font-semibold text-gray-900">Continue Shopping</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Explore more products and discover great deals on electronics.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2 cursor-pointer">
                Shop More <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Need Help? We're Here for You
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Product Updates */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Product Updates</h3>
              <p className="text-sm text-gray-600 mb-4">
                Questions about your order or need to make changes?
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 cursor-pointer">
                  Contact Support
                </Button>
              </Link>
            </div>

            {/* Refunds */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <div className="w-6 h-6 text-green-600">💰</div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Returns & Refunds</h3>
              <p className="text-sm text-gray-600 mb-4">
                Easy returns within 7 days. Get full refund or exchange.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 cursor-pointer">
                  Return Policy
                </Button>
              </Link>
            </div>

            {/* Contact */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get instant help via chat, email, or phone support.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 cursor-pointer">
                  Get Help
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@electronic.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Live Chat Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Order confirmation and tracking details have been sent to your email.
          </p>
        </div>
      </main>
    </div>
  )
}
