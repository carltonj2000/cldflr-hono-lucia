import { Hono } from "hono";

import Layout from "./layout";
import { signUpV } from "./schemas";
import { generateId, Scrypt } from "lucia";
import { initializeLucia } from "./db";

const app = new Hono();

app.get("/", (c) => {
  return c.html(
    <Layout>
      <h1>Sign Up</h1>
      <form method="post">
        <input id="email" name="email" type="text" />
        <label htmlFor="email"> Email</label>
        <br />
        <input id="password" name="password" type="password" />
        <label htmlFor="password"> Password</label>
        <br />
        <button type="submit">Sign Up</button>
      </form>
    </Layout>
  );
});

app.post("/", signUpV, async (c) => {
  const { email, password } = c.req.valid("form");
  console.log({ email, password });
  const hashedPassword = await new Scrypt().hash(password);
  const userId = generateId(15);
  const lucia = initializeLucia(c.env.DB);
  try {
    const insertUser = await c.env.DB.prepare(
      "insert into users (id, email, hashed_password) values (?, ?, ?) returning *"
    )
      .bind(userId, email, hashedPassword)
      .first();
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    c.header("Set-Cookie", sessionCookie.serialize());
    return c.redirect("/");
  } catch (e: any) {
    console.error({ e });
    return c.body("Something went wrong", 400);
  }
});

export default app;
