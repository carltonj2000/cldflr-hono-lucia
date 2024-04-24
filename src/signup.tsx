import Layout from "./layout";
import { signUpV } from "./schemas";
import { generateId, Scrypt } from "lucia";
import { initializeLucia } from "./db";
import appInit from "./app";
import { generateEmailVerificationCode } from "./util";
import { emailVerificationCode } from "./email";

const app = appInit();

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
  const hashedPassword = await new Scrypt().hash(password);
  const userId = generateId(15);
  const lucia = initializeLucia(c.env.DB);
  try {
    const insertUser = await c.env.DB.prepare(
      "insert into users (id, email, hashed_password, email_verified) " +
        "values (?, ?, ?, ?) returning *"
    )
      .bind(userId, email, hashedPassword, false)
      .first();

    const verificationCode = await generateEmailVerificationCode(
      userId,
      email,
      c.env.DB
    );

    await emailVerificationCode(
      {},
      email,
      "Verification Code",
      verificationCode
    );
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
