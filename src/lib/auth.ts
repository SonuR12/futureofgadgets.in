import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Default admin
        if (credentials.email === 'admin@electronic.com') {
          let admin = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!admin) {
            admin = await prisma.user.create({
              data: {
                email: credentials.email,
                name: 'Sonu',
                phone: '9905757864',
                role: 'admin',
                password: await bcrypt.hash(credentials.password, 12)
              }
            })
          } else if (admin.role !== 'admin') {
            admin = await prisma.user.update({
              where: { email: credentials.email },
              data: { role: 'admin', name: 'Sonu', phone: '9905757864' }
            })
          }

          if (admin.password && await bcrypt.compare(credentials.password, admin.password)) {
            return { id: admin.id, email: admin.email, name: admin.name || 'Admin', role: admin.role, emailVerified: true }
          }
          return null
        }



        // Sign in existing user
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.password) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name || 'User', role: user.role, emailVerified: user.emailVerified }
      }
    })
  ],

  session: { strategy: 'jwt' },

  pages: { signIn: '/auth/signin' },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role || (user.email === 'admin@electronic.com' ? 'admin' : 'user')
        token.emailVerified = account?.provider === 'google' ? true : (user.emailVerified ?? false)
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.emailVerified = token.emailVerified as boolean
      }
      return session
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: user.email } })
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              phone: user.email === 'admin@electronic.com' ? '9905757864' : null,
              role: user.email === 'admin@electronic.com' ? 'admin' : 'user',
              emailVerified: true
            }
          })
        } else {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              emailVerified: true,
              role: user.email === 'admin@electronic.com' ? 'admin' : existingUser.role,
              name: user.name || existingUser.name,
              phone: user.email === 'admin@electronic.com' ? '9905757864' : existingUser.phone
            }
          })
        }
      }
      return true
    }
  }
}
