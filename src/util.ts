import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";

export async function generateEmailVerificationCode(
  userId: string,
  email: string,
  db: D1Database
) {
  await db
    .prepare("delete from email_verification_codes where user_id=?")
    .bind(userId)
    .run();
  const code = generateRandomString(8, alphabet("0-9"));
  await db
    .prepare(
      "insert into email_verification_codes " +
        "(user_id, email, code, expires_at) values (?, ?, ?, ?)"
    )
    .bind(userId, email, code, createDate(new TimeSpan(15, "m")).toString())
    .run();
  return code;
}
