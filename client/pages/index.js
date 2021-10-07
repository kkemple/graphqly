import React from "react";
import GitHubLogin from "react-github-login";

export default function HomePage() {
  async function handleSuccess({ code }) {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth", {
      method: "post",
      body: code,
    });
    const token = await response.text();

    localStorage.setItem("graphqly:token", token);
  }

  function handleFailure(response) {
    console.log(response);
  }

  return (
    <div>
      <GitHubLogin
        redirectUri="http://localhost:3000"
        clientId="Iv1.63bae47e90585b1e"
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
    </div>
  );
}
