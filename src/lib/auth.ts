import { useSession, signIn, signOut } from "next-auth/react";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";




export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET!,              // ✅ non-null assertion

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {            // ✅ actually uses params
      if (user) token.id = user.id;
      if (account) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {              // ✅ actually attaches data
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export const useAuth = () => {
  const { data: session, status } = useSession();

  const handleSignIn = async (callbackUrl = "/") => {  // ✅ wrapped with error handling
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  };

  const handleSignOut = async (callbackUrl = "/") => {
  try {
    await signOut({
      callbackUrl: "/",   // always safe default
      redirect: true,     // 🔥 important
    });
  } catch (err) {
    console.error("Sign-out failed:", err);
  }
};

  return {
    session,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
};