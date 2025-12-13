import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        let client: MongoClient | null = null;

        try {
          client = await MongoClient.connect(
            process.env.MONGODB_URI ||
              'mongodb+srv://tejbonthu45_db_user:k476QemWIp0ZYusO@cyberintelcluster.q7kvfn9.mongodb.net/?retryWrites=true&w=majority&appName=CyberIntelCluster'
          );

          const db = client.db(process.env.MONGODB_DB || 'soc_platform');

          const user = await db.collection('users').findOne({
            email: credentials.email,
          });

          if (!user) {
            throw new Error('No user found with this email');
          }

          const passwordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!passwordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed');
        } finally {
          if (client) {
            await client.close();
          }
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret:
    process.env.NEXTAUTH_SECRET ||
    'r4Nd0M-N3xTAuth-S3Cr3T-9X2KpQ1LZm',

  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
