import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { sql } from '@vercel/postgres';
import { comparePassword } from '../../../lib/passwordUtils';

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const result = await sql`
            SELECT * FROM users WHERE username = ${credentials.username};
          `;

          const user = result.rows[0];

          if (!user) {
            throw new Error('Username atau Password salah');
          }

          const isPasswordMatch = await comparePassword(
            credentials.password,
            user.password
          );

          if (!isPasswordMatch) {
            throw new Error('Username atau Password salah');
          }

          return {
            id: user.id,
            name: user.username,
            email: user.username + '@xayztech.com',
            role: user.role,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          throw new Error('Terjadi kesalahan saat login');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});