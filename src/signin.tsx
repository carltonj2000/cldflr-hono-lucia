import Layout from "./layout";
import { signInV } from "./schemas";
import { Scrypt } from "lucia";
import { UserT, initializeLucia } from "./db";
import appInit from "./app";

const app = appInit();

app.get("/", (c) => {
  return c.html(
    <Layout>
      <h1>Sign In</h1>
      <form method="post">
        <input id="email" name="email" type="text" />
        <label htmlFor="email"> Email</label>
        <br />
        <input id="password" name="password" type="password" />
        <label htmlFor="password"> Password</label>
        <br />
        <button type="submit">Sign In</button>
      </form>
    </Layout>
  );
});

app.post("/", signInV, async (c) => {
  const { email, password } = c.req.valid("form");
  const user = await c.env.DB.prepare("select * from users where email=?")
    .bind(email)
    .first<UserT>();

  if (!user) return c.body("User does not exist", 400);

  const validPassword = await new Scrypt().verify(
    user.hashed_password,
    password
  );

  if (!validPassword) {
    return c.body("Password incorrect", 400);
  }

  const lucia = initializeLucia(c.env.DB);
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  c.header("Set-Cookie", sessionCookie.serialize());
  return c.redirect("/");
});

export default app;
