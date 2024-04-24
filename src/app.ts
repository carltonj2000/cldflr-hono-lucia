import { Hono } from "hono";
import type { User, Session } from "lucia";

export type Bindings = {
  DB: D1Database;
  DKIM_PRIVATE_KEY?: string;
};

const appInit = () =>
  new Hono<{
    Bindings: Bindings;
    Variables: {
      user: User | null;
      session: Session | null;
    };
  }>();

export default appInit;
