# Electronic Web - E-commerce Platform

A modern e-commerce platform built with Next.js 14, featuring a clean Flipkart-inspired design for electronics and tech products.

## 📸 Screenshot  

![Portfolio Screenshot](https://github.com/SonuR12/Electronic_Web/blob/main/public/Screenshot.png)

---

## 🚀 Features

### 🛍️ E-commerce Core
- **Product Catalog**: Browse electronics with categories (Laptops, Desktops, Monitors, Keyboards, Headphones)
- **Shopping Cart**: Add/remove items with quantity management and toast notifications
- **Search**: Real-time product search with keyboard navigation and suggestions
- **Categories**: Hover-triggered dropdown navigation with icons and descriptions

### 👤 User Management
- **Authentication**: Sign in/up with NextAuth.js (Credentials + Google OAuth)
- **Email Verification**: Automatic email verification on signup with resend option
- **Password Reset**: Forgot password functionality with secure email tokens
- **User Profile**: Editable profile with phone/address fields and order history
- **Protected Routes**: Secure access to profile, orders, and admin areas
- **Session Management**: Persistent login with loading states

### 📱 Modern UI/UX
- **Flipkart-Style Design**: Clean white sections with gray separators
- **Responsive Layout**: Mobile-first design with Tailwind CSS
- **Interactive Elements**: Hover effects, smooth transitions, and loading states
- **Toast Notifications**: User feedback for all actions (Sonner)
- **Icons**: Lucide React icons throughout the interface

### 🛒 Shopping Experience
- **Product Grid**: Responsive product display with images and pricing
- **Cart Management**: Persistent cart with localStorage sync
- **Empty States**: Friendly messages for empty cart/categories
- **Order Tracking**: Order history with status indicators
- **Email Notifications**: Automatic order notifications to admin email

### 🔧 Admin Features
- **Admin Panel**: Product management for admin users
- **Role-based Access**: Admin-only routes and features
- **Product CRUD**: Add, edit, and manage product inventory

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth.js
- **State Management**: React hooks + localStorage
- **Icons**: Lucide React
- **Notifications**: Sonner
- **TypeScript**: Full type safety
- **Image Optimization**: Next.js Image component

## 📁 Project Structure

```
src/
├── app/                    # App Router pages
│   ├── about/             # About page
│   ├── admin/             # Admin panel
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── category/          # Category pages
│   ├── contact/           # Contact page
│   ├── orders/            # Order management
│   └── profile/           # User profile
├── components/            # Reusable components
│   ├── admin/             # Admin components
│   ├── auth/              # Auth components
│   ├── cart/              # Cart components
│   └── ui/                # UI components
└── lib/                   # Utilities and data
    ├── auth.ts            # Auth configuration
    ├── cart.ts            # Cart management
    └── data/              # Mock data
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Electronic_Web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your environment variables
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Access

- **Email**: admin@electronic.com
- **Password**: admin123

## 📱 Key Pages

- **Homepage** (`/`): Featured products and categories
- **Categories** (`/category/[slug]`): Product listings by category
- **Cart** (`/cart`): Shopping cart management
- **Profile** (`/profile`): User profile and order history
- **Orders** (`/orders`): Detailed order tracking
- **About** (`/about`): Company information
- **Contact** (`/contact`): Contact form and information
- **Admin** (`/admin`): Product management (admin only)

## 🎨 Design Features

- **Flipkart-inspired UI**: Clean, professional e-commerce design
- **Responsive Design**: Works on all device sizes
- **Interactive Navigation**: Hover dropdowns and smooth transitions
- **Loading States**: Skeleton screens and spinners
- **Toast Notifications**: Real-time user feedback
- **Form Validation**: Client-side validation with error handling

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📄 License

This project is licensed under the MIT License.
