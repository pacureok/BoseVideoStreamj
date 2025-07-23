/// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ¡IMPORTACIONES ACTUALIZADAS!
import { comparePassword } from "@/src/utils/authService"; // Ahora apunta a src/utils/authService.ts
import { query } from "@/src/utils/dbService";     // Ahora apunta a src/utils/dbService.ts

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const userRes = await query("SELECT id, username, password, is_creator FROM users WHERE username = $1", [credentials.username]);
        const user = userRes.rows[0];

        if (!user || !(await comparePassword(credentials.password, user.password))) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          isCreator: user.is_creator,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isCreator = user.isCreator;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.isCreator = token.isCreator;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
