import { Lucia } from "lucia";
import { D1Adapter } from "@lucia-auth/adapter-sqlite";

export function initializeLucia(D1: D1Database) {
  const adapter = new D1Adapter(D1, {
    user: "users",
    session: "sessions",
  });
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: false,
      },
    },
    getUserAttributes: (attributes) => {
      return {
        email: attributes.email,
        email_verified: Boolean(attributes.email_verified),
      };
    },
  });
}

interface DatabaseUserAttributes {
  email: string;
  email_verified: number;
}

declare module "lucia" {
  interface Register {
    Auth: ReturnType<typeof initializeLucia>;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

export type UserT = {
  id: string;
  email: string;
  hashed_password: string;
  email_verified: number;
};

export type SessionT = {
  id: string;
  expires_at: number;
  user_id: string;
};

export type EmailVerificationCodeT = {
  id: number;
  email: string;
  user_id: string;
  code: string;
  expires_at: string;
};
