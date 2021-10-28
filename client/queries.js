import { gql } from "@apollo/client";

export const LIST_PROJECTS = gql`
  query ListProjects {
    me {
      projects {
        id
        name
      }
    }
  }
`;
