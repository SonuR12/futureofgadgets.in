import crypto from 'crypto'
import nodemailer from 'nodemailer'

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
}

export function generateCodeExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('📧 Email would be sent to:', to)
    console.log('📧 Subject:', subject)
    const codeMatch = html.match(/<div[^>]*>\s*(\d{6})\s*<\/div>/)
    if (codeMatch) {
      console.log('📧 Verification Code:', codeMatch[1])
    }
    return true
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    })

    console.log('✅ Email sent to:', to)
    return true
  } catch (error: any) {
    console.log('⚠️ Email failed, logging to console instead')
    const codeMatch = html.match(/<div[^>]*>\s*(\d{6})\s*<\/div>/)
    if (codeMatch) {
      console.log('📧 Verification Code:', codeMatch[1])
    }
    return true
  }
}

export function getVerificationEmailTemplate(code: string, email: string): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff;">
      <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Future Of Gadgets</h1>
      <p style="color: #64748b; margin: 0 0 40px 0; font-size: 16px;">Verify your email address</p>
      
      <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">Welcome!</h2>
      <p style="color: #475569; margin: 0 0 32px 0; font-size: 15px; line-height: 1.6;">Thank you for signing up. Enter this verification code to complete your registration:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; font-size: 36px; font-weight: 700; letter-spacing: 10px; border-radius: 6px;">${code}</span>
      </div>
      
      <p style="color: #94a3b8; font-size: 13px; margin: 40px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">This code expires in 10 minutes. If you didn't create an account, ignore this email.</p>
    </div>
  `
}

export function getPasswordResetEmailTemplate(code: string, email: string): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff;">
      <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Future Of Gadgets</h1>
      <p style="color: #64748b; margin: 0 0 40px 0; font-size: 16px;">Reset your password</p>
      
      <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">Password Reset Request</h2>
      <p style="color: #475569; margin: 0 0 32px 0; font-size: 15px; line-height: 1.6;">We received a request to reset your password. Enter this code to proceed:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; font-size: 36px; font-weight: 700; letter-spacing: 10px; border-radius: 6px;">${code}</span>
      </div>
      
      <p style="color: #94a3b8; font-size: 13px; margin: 40px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `
}

export function getOrderNotificationTemplate(orderData: {
  orderId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: Array<{ name: string; qty: number; price: number; color?: string }>
  total: number
  address: string
  paymentMethod: string
}): string {
  const itemsHtml = orderData.items
    .map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px;">
          ${item.name}
          ${item.color ? `<br><span style="color: #64748b; font-size: 12px;">Color: ${item.color}</span>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">×${item.qty}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 600;">₹${(item.price * item.qty).toLocaleString()}</td>
      </tr>
    `).join('')

  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff;">
      <h1 style="color: #2563eb; margin: 0 0 8px 0; font-size: 28px; font-weight: 600;">New Order</h1>
      <p style="color: #64748b; margin: 0 0 12px 0; font-size: 15px;">Future of Gadgets</p>
      <p style="color: #94a3b8; margin: 0 0 40px 0; font-size: 13px;">${new Date().toLocaleString('en-IN')}</p>
      
      <div style="margin-bottom: 32px;">
        <p style="color: #64748b; margin: 0 0 4px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
        <p style="color: #0f172a; margin: 0; font-size: 16px; font-weight: 600;">${orderData.orderId}</p>
      </div>
      
      <div style="margin-bottom: 32px;">
        <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Customer</h2>
        <p style="color: #475569; margin: 0 0 8px 0; font-size: 15px;">${orderData.customerName}</p>
        <p style="color: #64748b; margin: 0 0 4px 0; font-size: 14px;">${orderData.customerPhone}</p>
        ${orderData.customerEmail ? `<p style="color: #64748b; margin: 0; font-size: 14px;">${orderData.customerEmail}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 32px;">
        <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Items</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #0f172a;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #0f172a; font-size: 16px; font-weight: 600;">Total</td>
              <td style="text-align: right; color: #2563eb; font-size: 20px; font-weight: 700;">₹${orderData.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div style="margin-bottom: 32px;">
        <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Delivery Address</h2>
        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">${orderData.address}</p>
      </div>
      
      <div style="margin-bottom: 32px;">
        <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Payment</h2>
        <p style="color: #475569; margin: 0; font-size: 14px;">${orderData.paymentMethod.toUpperCase()}</p>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; margin: 40px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">Automated notification from Future of Gadgets</p>
    </div>
  `
}

export function getOrderConfirmationTemplate(orderData: {
  orderId: string
  customerName: string
  items: Array<{ name: string; qty: number; price: number; color?: string }>
  total: number
  address: string
  paymentMethod: string
  deliveryDate?: Date
}): string {
  const itemsHtml = orderData.items
    .map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px;">
          ${item.name}
          ${item.color ? `<br><span style="color: #64748b; font-size: 12px;">Color: ${item.color}</span>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">×${item.qty}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 600;">₹${(item.price * item.qty).toLocaleString()}</td>
      </tr>
    `).join('')

  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff;">
      <h1 style="color: #2563eb; margin: 0 0 8px 0; font-size: 28px; font-weight: 600;">Order Confirmed</h1>
      <p style="color: #64748b; margin: 0 0 12px 0; font-size: 15px;">Future of Gadgets</p>
      <p style="color: #94a3b8; margin: 0 0 40px 0; font-size: 13px;">${new Date().toLocaleString('en-IN')}</p>
      
      <p style="color: #475569; margin: 0 0 32px 0; font-size: 15px; line-height: 1.6;">Hi ${orderData.customerName}, thank you for your order! We'll send you a shipping confirmation email as soon as your order ships.</p>
      
      <div style="margin-bottom: 32px;">
        <p style="color: #64748b; margin: 0 0 4px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
        <p style="color: #0f172a; margin: 0; font-size: 16px; font-weight: 600;">${orderData.orderId}</p>
      </div>
      
      <div style="margin-bottom: 32px;">
        <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #0f172a;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #0f172a; font-size: 16px; font-weight: 600;">Total</td>
              <td style="text-align: right; color: #2563eb; font-size: 20px; font-weight: 700;">₹${orderData.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div style="margin-bottom: 32px;">
        <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Delivery Address</h2>
        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">${orderData.address}</p>
      </div>
      
      ${orderData.deliveryDate ? `<div style="margin-bottom: 32px;">
        <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Expected Delivery</h2>
        <p style="color: #475569; margin: 0; font-size: 14px;">${new Date(orderData.deliveryDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>` : ''}
      
      <div style="margin-bottom: 32px;">
        <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Payment Method</h2>
        <p style="color: #475569; margin: 0; font-size: 14px;">${orderData.paymentMethod.toUpperCase()}</p>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; margin: 40px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">Thank you for shopping with Future of Gadgets!</p>
    </div>
  `
}
