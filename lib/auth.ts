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
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const isValid = await validateCredentials(
            credentials.username as string,
            credentials.password as string
          );
          
          if (isValid) {
            return {
              id: '1',
              name: credentials.username as string,
            }
          }
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
});

async function validateCredentials(username: string, password: string): Promise<boolean> {
  return process.env.ADMIN_USERNAME === username && 
         process.env.ADMIN_PASSWORD === password;
}
