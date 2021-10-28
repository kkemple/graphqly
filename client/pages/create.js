import React from "react";
import dynamic from "next/dynamic";
import { gql, useQuery } from "@apollo/client";
import Repo from "../components/Repo";

const AuthCheck = dynamic(() => import("../components/AuthCheck"), {
  ssr: false,
});

const LIST_REPOS = gql`
  query ListRepos {
    me {
      repos {
        id
        name
        defaultBranch
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
        <Repo key={repo.id} repo={repo} />
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
