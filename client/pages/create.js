import React from "react";
import dynamic from "next/dynamic";
import { gql, useQuery } from "@apollo/client";

const AuthCheck = dynamic(() => import("../components/AuthCheck"), {
  ssr: false,
});

const LIST_REPOS = gql`
  query Me {
    me {
      repos {
        id
        name
      }
    }
  }
`;

function ListRepos() {
  const { data, loading, error } = useQuery(LIST_REPOS);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const { repos } = data.me;

  if (!repos.length) {
    return <div>You have no repos</div>;
  }

  return (
    <ul>
      {repos.map((repo) => (
        <li key={repo.id}>{repo.name}</li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <AuthCheck>
      <ListRepos />
    </AuthCheck>
  );
}
