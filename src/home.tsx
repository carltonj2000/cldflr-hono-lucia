import Layout from "./layout";
import { EmailVerificationCodeT, UserT, initializeLucia } from "./db";
import appInit from "./app";
import { verifyV } from "./schemas";
import { isWithinExpirationDate } from "oslo";
import { emailVerificationCode } from "./email";

const app = appInit();

app.get("/", (c) => {
  const user = c.get("user") as UserT;
  if (user) {
    return c.html(
      <Layout>
        {!user.email_verified ? (
          <form method="post" action="verify">
            <label htmlFor="verificationCode">Verification Code: </label>
            <input id="verificationCode" name="verificationCode" type="text" />
            <button type="submit">Verify Code</button>
          </form>
        ) : (
          <h1>Welcome {user.email}</h1>
        )}

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
        {/* <br />
        <form method="post" action="sendmail">
          <button type="submit">Sendmail</button>
        </form> */}
      </Layout>
    );
  }
});

/* function below used for testing the email */
app.post("sendmail", async (c) => {
  await emailVerificationCode(
    c.env,
    "carlton.joseph@gmail.com",
    "Verification Code",
    "thisIsTheCode"
  );
  return c.redirect("/");
});

app.post("signout", async (c) => {
  const lucia = initializeLucia(c.env.DB);
  const session = c.get("session");
  if (session) await lucia.invalidateUserSessions(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  c.header("Set-Cookie", sessionCookie.serialize());
  return c.redirect("/");
});

app.post("verify", verifyV, async (c) => {
  const { verificationCode } = c.req.valid("form");
  const user = c.get("user") as UserT;
  if (!user) return c.body(null, 400);
  const evcDb = await c.env.DB.prepare(
    "delete from email_verification_codes where " +
      "user_id = ? and code = ? and email = ? returning *"
  )
    .bind(user.id, verificationCode, user.email)
    .first<EmailVerificationCodeT>();

  if (evcDb && isWithinExpirationDate(new Date(evcDb.expires_at))) {
    const lucia = initializeLucia(c.env.DB);
    await lucia.invalidateSession(user.id);
    await c.env.DB.prepare(
      "update users set email_verified = 1 where email = ?"
    )
      .bind(evcDb.email)
      .run();

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    c.header("Set-Cookie", sessionCookie.serialize());
  }

  return c.redirect("/");
});

export default app;
