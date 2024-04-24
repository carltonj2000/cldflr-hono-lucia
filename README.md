# Hono Lucia On Cloudflare Workers

## Code History

The code in this repository is base on the following.

- https://youtu.be/ZD2Lt5GFo48?si=VhFNeU_7fNgmsnqK
- https://github.com/andfadeev/cloudflare-hono-lucia-auth

Email setup instructions are at the following.

- https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels
- https://support.mailchannels.com/hc/en-us/articles/16918954360845-Secure-your-domain-name-against-spoofing-with-Domain-Lockdown

## Code Creation

```bash
npm create hono@latest cldflr-hono-lucia
cd cldflr-hono-lucia/
npm install lucia oslo
npm install @lucia-auth/adapter-sqlite
npm i zod
npm i @hono/zod-validator
npm install nodemailer
npm install @types/nodemailer -D
```

### Cloudflare D1

```bash
npx wrangler d1 create cldflr-hono-lucia

npx wrangler d1 migrations create cldflr-hono-lucia init
npx wrangler d1 migrations create cldflr-hono-lucia email_verification
npx wrangler d1 migrations apply cldflr-hono-lucia
npx wrangler d1 migrations apply cldflr-hono-lucia --remote
```

```bash
npx wrangler d1 execute cldflr-hono-lucia --command "select * from users"
npx wrangler d1 execute cldflr-hono-lucia --command 'delete from users where email = "carlton.joseph@gmail.com"'
npx wrangler d1 execute cldflr-hono-lucia --command "select * from email_verification_codes"
```
