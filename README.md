# Hono Lucia On Cloudflare Workers

After `npm run deploy` set the env variable DKIM_PRIVATE_KEY to
the content (on vercel/host) of the `priv_key.txt` file.
Use `npx wrangler tail` to see logs of running deployment.

## Code History

The code in this repository is base on the following.

- https://youtu.be/ZD2Lt5GFo48?si=VhFNeU_7fNgmsnqK
- https://github.com/andfadeev/cloudflare-hono-lucia-auth

Email setup instructions are at the following.

- https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels
- https://support.mailchannels.com/hc/en-us/articles/16918954360845-Secure-your-domain-name-against-spoofing-with-Domain-Lockdown
- https://support.mailchannels.com/hc/en-us/articles/7122849237389-Adding-a-DKIM-Signature
- https://support.google.com/a/answer/81126

## Domain Lockdown

Used the first one below but the second was suggested and did not work.

```DNS TXT
name: _mailchannels, value: v=mc1 cfId=carltonjoseph.workers.dev
name: _mailchannels, value: v=mc1 cfId=cldflr-hono-lucia.workers.dev
```

## DKIM

```bash
openssl genrsa 2048 | tee priv_key.pem | openssl rsa -outform der | openssl base64 -A > priv_key.txt
echo -n "v=DKIM1;p=" > pub_key_record.txt && \
openssl rsa -in priv_key.pem -pubout -outform der | openssl base64 -A >> pub_key_record.txt
```

Add the following DNS TXT record.

```dns
mailchannels._domainkey IN TXT "v=DKIM1; p=<content of the file pub_key_record.txt>"

_dmarc IN TXT "v=DMARC1; p=reject; adkim=s; aspf=s; rua=mailto:YYY; ruf=mailto:YYY pct=100; fo=1;"
```

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
