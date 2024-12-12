import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === 'aqua' && credentials?.password === 'laoma') {
          return {
            id: '1',
            name: 'Admin User',
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
});
