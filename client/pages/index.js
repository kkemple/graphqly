import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import { LIST_PROJECTS } from "../queries";

const AuthCheck = dynamic(() => import("../components/AuthCheck"), {
  ssr: false,
});

function ListProjects() {
  const { data, loading, error } = useQuery(LIST_PROJECTS);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const { projects } = data.me;
  return (
    <>
      <Link href="/create">
        <button>Create project</button>
      </Link>
      {!projects.length ? (
        <div>You have no projects</div>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              {project.name} ({project.repoUrl})
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <AuthCheck>
      <ListProjects />
    </AuthCheck>
  );
}
