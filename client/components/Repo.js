import React from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { LIST_PROJECTS } from "../queries";

const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      name
      branchName
      schemaPath
      repo {
        url
      }
    }
  }
`;

export default function Repo({ repo }) {
  const router = useRouter();
  const [createProject, { loading }] = useMutation(CREATE_PROJECT, {
    onError(error) {
      alert(error.message);
    },
    onCompleted(data) {
      router.push(`/projects/${data.createProject.id}/settings`);
    },
    // update(cache, { data }) {
    //   const { me } = cache.readQuery({ query: LIST_PROJECTS });
    //   cache.writeQuery({
    //     query: LIST_PROJECTS,
    //     data: {
    //       me: {
    //         ...me,
    //         projects: [...me.projects, data.createProject],
    //       },
    //     },
    //   });
    // },
    variables: {
      input: {
        name: repo.name,
        branchName: repo.defaultBranch || "main",
        schemaPath: "schema.graphql",
        repoId: repo.id,
        apolloKey: "",
      },
    },
  });

  return (
    <li>
      {repo.name}{" "}
      <button onClick={createProject} disabled={loading}>
        Create project
      </button>
    </li>
  );
}
