import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db as prisma } from "@workspace/database";
import bcrypt from "bcryptjs";
import { z } from "zod";
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const { email, password } = loginSchema.parse(credentials);
                const user = await prisma.user.findUnique({
                    where: { email },
                });
                if (!user || !user.password) {
                    return null;
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
        newUser: "/auth/new-user",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                // Auto-approve Google sign-ins
                return true;
            }
            return true;
        },
    },
    events: {
        async signIn({ user, account, isNewUser }) {
            if (isNewUser) {
                // Log new user registration
                console.log(`New user registered: ${user.email}`);
            }
        },
        async signOut({ session, token }) {
            // Log user sign out
            console.log(`User signed out: ${session?.user?.email || token?.email}`);
        },
    },
    debug: process.env.NODE_ENV === "development",
});
// Export the configuration for backward compatibility
export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const { email, password } = loginSchema.parse(credentials);
                const user = await prisma.user.findUnique({
                    where: { email },
                });
                if (!user || !user.password) {
                    return null;
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
        newUser: "/auth/new-user",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                // Auto-approve Google sign-ins
                return true;
            }
            return true;
        },
    },
    events: {
        async signIn({ user, account, isNewUser }) {
            if (isNewUser) {
                // Log new user registration
                console.log(`New user registered: ${user.email}`);
            }
        },
        async signOut({ session, token }) {
            // Log user sign out
            console.log(`User signed out: ${session?.user?.email || token?.email}`);
        },
    },
    debug: process.env.NODE_ENV === "development",
};
//# sourceMappingURL=auth.js.map