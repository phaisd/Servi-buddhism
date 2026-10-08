async function login() {
  const csrfRes = await fetch("http://localhost:3010/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  console.log("CSRF Token:", csrfToken);

  const res = await fetch("http://localhost:3010/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": csrfRes.headers.get("set-cookie") || "",
    },
    body: new URLSearchParams({
      csrfToken,
      email: "admin@app.local",
      password: "Passw0rd!vibe",
    }).toString(),
    redirect: "manual"
  });

  console.log("Status:", res.status);
  console.log("Headers:", res.headers);
  console.log("URL:", res.url);
}

login().catch(console.error);
