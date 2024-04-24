const emailVerificationCode = async (
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
      email: "appsfortracking@gmail.com",
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
    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } else {
    console.log("Sending email");
    console.log(body);
  }
};
