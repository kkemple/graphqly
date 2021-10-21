import React from "react";
import { useQuery, gql } from "@apollo/client";
import GitHubLogin from "react-github-login";

const GET_USER = gql`
  query Me {
    me {
      name
      email
    }
  }
`;

export default function AuthCheck({ children }) {
  const { data, loading, error, client } = useQuery(GET_USER);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
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

  function logOut() {
    localStorage.removeItem(process.env.NEXT_PUBLIC_TOKEN_KEY);
    client.resetStore();
  }

  return (
    <div>
      Logged in as {data.me.name}
      <button onClick={logOut}>Log out</button>
      <div>{children}</div>
    </div>
  );
}
