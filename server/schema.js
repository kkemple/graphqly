const { gql } = require("apollo-server-express");

exports.typeDefs = gql`
  type Query {
    me: User
  }

  type Mutation {
    createProject(input: ProjectInput!): Project
  }

  input ProjectInput {
    name: String!
    branchName: String!
    schemaPath: String!
    repoId: String!
    apolloKey: String!
  }

  type User {
    email: String
    name: String!
    projects: [Project!]!
    repos: [Repo!]!
  }

  type Project {
    id: ID!
    name: String!
    branchName: String!
    schemaPath: String!
    repo: Repo!
  }

  type Repo {
    id: ID!
    name: String!
    url: String!
    defaultBranch: String
  }
`;

const REPO_FRAGMENT = gql`
  fragment RepoFragment on Repository {
    id
    name
    url
    defaultBranchRef {
      name
    }
  }
`;

const GET_REPO = gql`
  query GetRepo($id: ID!) {
    node(id: $id) {
      ... on Repository {
        ...RepoFragment
      }
    }
  }
  ${REPO_FRAGMENT}
`;

const LIST_REPOS = gql`
  query ListRepos {
    viewer {
      repositories(
        first: 100
        isFork: false
        affiliations: OWNER
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        nodes {
          ...RepoFragment
        }
      }
    }
  }
  ${REPO_FRAGMENT}
`;

exports.resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      return user;
    },
  },
  Mutation: {
    createProject: (_, { input }, { user, prisma }) =>
      prisma.project.create({
        data: {
          ...input,
          userId: user.id,
        },
      }),
  },
  User: {
    projects: (_, __, { user, prisma }) =>
      prisma.project.findMany({
        where: { userId: user.id },
      }),
    repos: async (_, __, { github }) => {
      const data = await github.request(LIST_REPOS);
      return data.viewer.repositories.nodes;
    },
  },
  Repo: {
    defaultBranch: (repo) => repo.defaultBranchRef?.name,
  },
  Project: {
    repo: async (project, _, { github }) => {
      const data = await github.request(GET_REPO, { id: project.repoId });
      return data.node;
    },
  },
};
