import Layout from "./layout";
import { UserT, initializeLucia } from "./db";
import appInit from "./app";

const app = appInit();

app.get("/", (c) => {
  const user = c.get("user") as UserT;
  if (user) {
    return c.html(
      <Layout>
        <h1>Welcome {user.email}</h1>
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
  const session: any = c.get("session");
  if (session) await lucia.invalidateUserSessions(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  c.header("Set-Cookie", sessionCookie.serialize());
  return c.redirect("/");
});
export default app;
