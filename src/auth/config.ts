import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

// -----------------------------------------------------------------------------
// 1. SINGLETON MONGODB CLIENT PROMISE FOR NEXTAUTH ADAPTER
// -----------------------------------------------------------------------------
const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Only create MongoDB client if URI exists and we're on the server
const isServer = typeof window === 'undefined';

if (isServer && uri) {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Prevent build-time crash if environment variables are missing or on client
  clientPromise = Promise.reject(
    new Error(isServer ? "MONGODB_URI is not defined in environment variables" : "MongoDB client not available on client")
  );
}

// -----------------------------------------------------------------------------
// 2. DYNAMIC PROVIDERS REGISTRATION
// -----------------------------------------------------------------------------
const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Please enter your email address and password.");
      }

      try {
        await connectToDatabase();

        const user = await User.findOne({
          email: credentials.email.toLowerCase().trim(),
        })
          .select("+password")
          .lean();

        if (!user) {
          throw new Error("Invalid email address or password.");
        }

        if (!user.password) {
          throw new Error(
            "This account uses social sign-in. Please sign in with Google or GitHub.",
          );
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) {
          throw new Error("Invalid email address or password.");
        }

        if (!user.emailVerified) {
          throw new Error(
            "Please verify your email address before logging in.",
          );
        }

        // Asynchronously update last login
        User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(
          (err) => console.error("Failed to update last login date:", err),
        );

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "CUSTOMER",
          avatar: user.avatar || null,
        };
      } catch (error: unknown) {
        console.error("Authorize credentials error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Authentication failed. Please check your network.");
      }
    },
  }),
];

// Only register OAuth providers if valid credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

// -----------------------------------------------------------------------------
// 3. NEXTAUTH CONFIGURATION
// -----------------------------------------------------------------------------
export const authConfig: NextAuthOptions = {
  // Only use MongoDB adapter on the server
  adapter: isServer && uri ? MongoDBAdapter(clientPromise) : undefined,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "CUSTOMER";
        token.avatar = (user as { avatar?: string | null }).avatar || null;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.role = session.user.role;
        token.avatar = session.user.avatar;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const sessionUser = session.user as typeof session.user & {
          id?: string;
          role?: string;
          avatar?: string | null;
        };

        sessionUser.id = token.id as string;
        sessionUser.role = token.role as string;
        sessionUser.avatar = token.avatar as string | null;
      }
      return session;
    },
  },
  // ✅ Supports BOTH NEXTAUTH_SECRET and AUTH_SECRET in Vercel
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authConfig;