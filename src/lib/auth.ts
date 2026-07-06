import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { headers } from "next/headers";

const dbProvider = (process.env.DATABASE_PROVIDER ?? "postgresql") as "postgresql" | "sqlite" | "mysql" | "cockroachdb";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: dbProvider,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }: { user: { email: string }; url: string; token: string }) => {
      console.log(`[DEV] Password reset for ${user.email}: ${url} (token: ${token})`);
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const existingMember = await prisma.organizationMember.findFirst({
            where: { userId: user.id },
          });
          if (!existingMember) {
            await prisma.organization.create({
              data: {
                name: `${user.name ?? user.email}'s Organization`,
                slug: `org-${user.id.slice(0, 8)}`,
                members: {
                  create: {
                    userId: user.id,
                    role: "admin",
                  },
                },
              },
            });
          }
        },
      },
    },
  },
});

export async function getSession() {
  const h = await headers();
  return auth.api.getSession({ headers: h });
}
