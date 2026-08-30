/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

// Create a MongoDB client for the adapter
let client: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    const { MongoClient } = await import("mongodb");
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined");
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export const authConfig: NextAuthOptions = {
  adapter: MongoDBAdapter(getMongoClient),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectToDatabase();

        // Find user with password field
        const user = await User.findOne({ email: credentials.email })
          .select("+password")
          .lean();

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Check if password matches
        if (!user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      // Add user role to token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Update token if session updated
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.role = session.user.role;
        token.avatar = session.user.avatar;
      }

      return token;
    },
    async session({ session, token }: any) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }: any) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut({ token }: any) {
      console.log(`User signed out: ${token.email}`);
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
