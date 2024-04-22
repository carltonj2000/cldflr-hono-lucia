import { Hono } from "hono";
import Layout from "./layout";
import { initializeLucia } from "./db";

const app = new Hono();

app.get("/", (c) => {
  const user = c.get("user");
  if (user) {
    return c.html(
      <Layout>
        <form method="post" action="signout">
          <button type="submit">Sign Out</button>
        </form>
      </Layout>
    );
  } else {
    return c.html(
      <Layout>
        <a href="signup">Sign Up</a>
        <br />
        <a href="signin">Sign In</a>
      </Layout>
    );
  }
});

app.post("signout", async (c) => {
  const lucia = initializeLucia(c.env.DB);
  const session = c.get("session");
  if (session) await lucia.invalidateUserSessions(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  c.header("Set-Cookie", sessionCookie.serialize());
  return c.redirect("/");
});
export default app;
