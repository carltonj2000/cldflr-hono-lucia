# Hono Lucia On Cloudflare Workers

## Code History

The code in this repository is base on the following:

- https://youtu.be/ZD2Lt5GFo48?si=VhFNeU_7fNgmsnqK
- https://github.com/andfadeev/cloudflare-hono-lucia-auth

## Code Creation

```bash
npm create hono@latest cldflr-hono-lucia
cd cldflr-hono-lucia/
npm install lucia oslo
npm install @lucia-auth/adapter-sqlite
npm i zod
npm i @hono/zod-validator
```

### Cloudflare D1

```bash
npx wrangler d1 create cldflr-hono-lucia

npx wrangler d1 migrations create cldflr-hono-lucia init
npx wrangler d1 migrations create cldflr-hono-lucia email_verification
npx wrangler d1 migrations apply cldflr-hono-lucia
npx wrangler d1 migrations apply cldflr-hono-lucia --remote
```
