import { Bindings } from "./app";

export const emailVerificationCode = async (
  env: Bindings,
  recipient: string,
  subject: string,
  content: string
) => {
  const body = {
    personalizations: [
      {
        to: [{ email: recipient }],
        dkim_domain: "appsfortracking.com",
        dkim_selector: "mailchannels",
        dkim_private_key: env.DKIM_PRIVATE_KEY,
      },
    ],
    from: {
      email: "carlton@appsfortracking.com",
      name: "Carlton Joseph",
    },
    subject: subject,
    content: [
      {
        type: "text/plain",
        value: content,
      },
    ],
  };
  if (env.DKIM_PRIVATE_KEY) {
    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const respText = await resp.text();
    console.log({ respText });
  } else {
    console.log("Sending email");
    console.log(body);
  }
};
