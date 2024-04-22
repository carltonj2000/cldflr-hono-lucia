import { Hono } from "hono";
import type { User, Session } from "lucia";
import { verifyRequestOrigin } from "lucia";
import { getCookie } from "hono/cookie";

import signUp from "./signup";
import signIn from "./signin";
import home from "./home";
import { initializeLucia } from "./db";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{
  Bindings: Bindings;
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", async (c, next) => {
  // CSRF middleware
  if (c.req.method === "GET") {
    return next();
  }
  const originHeader = c.req.header("Origin");
  // NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = c.req.header("Host");
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
    return c.body(null, 403);
  }
  return next();
});

app.use("*", async (c, next) => {
  const lucia = initializeLucia(c.env.DB);
  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    // use `header()` instead of `setCookie()` to avoid TS errors
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }
  c.set("user", user);
  c.set("session", session);
  return next();
});

app.route("/", home);
app.route("/signup", signUp);
app.route("/signin", signIn);

export default app;
