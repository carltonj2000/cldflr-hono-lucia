import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const signUpS = z.object({
  email: z.string().email(),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

export const signUpV = zValidator("form", signUpS, (result, c) => {
  if (!result.success) {
    return c.text("Invalid email or password!", 400);
  }
});

export const signInS = z.object({
  email: z.string().email(),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

export const signInV = zValidator("form", signInS, (result, c) => {
  if (!result.success) {
    return c.text("Invalid email or password!", 400);
  }
});
