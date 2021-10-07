import React from "react";
import { useQuery, gql } from "@apollo/client";
import GitHubLogin from "react-github-login";

const query = gql`
  query Me {
    me {
      name
      email
    }
  }
`;

export default function AuthCheck() {
  const { data, loading, error, client } = useQuery(query);

  function logOut() {
    localStorage.removeItem(process.env.NEXT_PUBLIC_TOKEN_KEY);
    client.resetStore();
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (data) {
    return (
      <div>
        <button onClick={logOut}>Log out</button>
      </div>
    );
  }

  async function handleSuccess({ code }) {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth", {
      method: "post",
      body: code,
    });
    const token = await response.text();

    localStorage.setItem(process.env.NEXT_PUBLIC_TOKEN_KEY, token);
    client.resetStore();
  }

  function handleFailure(response) {
    console.log(response);
  }

  return (
    <GitHubLogin
      redirectUri="http://localhost:3000"
      clientId="Iv1.63bae47e90585b1e"
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    />
  );
}
